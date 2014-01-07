using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;

namespace PublInquiryServer
{
	public class InquiryBuilder
	{
		#region Subclasses

		private class Relation
		{
			public readonly string Target;
			public readonly string PrimaryKey;
			public readonly string ForeignKey;

			public Relation(string target, string pk, string fk)
			{
				Target = target;
				PrimaryKey = pk;
				ForeignKey = fk;
			}
		}

		private class Join
		{
			public string Table;
			public string Alias;
			public string Condition;

			public Join(string table, string alias, string cond)
			{
				Table = table;
				Alias = alias;
				Condition = cond;
			}
		}

		private class Column
		{
			public string Expression;
			public string Alias;

			public Column(string expr, string alias)
			{
				Expression = expr;
				Alias = alias;
			}
		}

		private class InquiryData
		{
			public string Type;
			public string Alias;

			public readonly List<Column> Columns = new List<Column>();
			public readonly List<string> Conditions = new List<string>();
			public readonly List<Join> Joins = new List<Join>();
			public readonly List<string> Groups = new List<string>();

			public InquiryData(string type)
			{
				Type = type;
				Alias = GetAlias(type);
			}
		}

		#endregion

		#region Lookups

		// Replace rules:
		// {0} = column
		// {1} = value
		// {2} = from
		// {3} = to
		private static readonly Dictionary<string, string> OperatorMappings = new Dictionary<string, string>
		{
			{ "equals", "{0} = {1}" },
			{ "not-equals", "{0} <> {1}" },
			{ "null", "{0} IS NULL" },
			{ "not-null", "{0} IS NOT NULL" },
			{ "true", "{0} = true" },
			{ "not-true", "{0} = false" },
			{ "greater", "{0} > {1}" },
			{ "not-greater", "{0} < {1}" },
			{ "contains", "{0} LIKE '%{1}%'" },
			{ "not-contains", "{0} NOT LIKE '%{1}%'" },
			{ "between", "{0} BETWEEN {2} AND {3}" },
			{ "not-between", "{0} NOT BETWEEN {2} AND {3}" },
		};

		private static readonly Dictionary<string, string> InquiryMappings = new Dictionary<string, string>
		{
			{ "books", "content_profile" },
			{ "users", "users" },
			{ "series", "series" }
		};

		private static readonly Dictionary<string, Relation> RelationMappings = new Dictionary<string, Relation>
		{
			{ "book-owner", new Relation("users", "id", "author_id") },
			{ "book-creator", new Relation("users", "id", "creator_id") },
			{ "series-owner", new Relation("users", "id", "?") },
			{ "user-books", new Relation("books", "author_id", "id") },
			{ "user-series", new Relation("series", "?", "id") }
		};

		private static readonly Dictionary<string, Dictionary<string, string>> FieldMappings = new Dictionary<string, Dictionary<string, string>>
		{
			{
				"books",
				new Dictionary<string, string>
				{
					{ "name", "%a.name" },
					{ "descr", "%a.?" },
					{ "access-type", "%a.accesstype" },
					{ "state", "%a.state" },
					{ "size", "%a.size" },
					{ "pages", "%a.pagescount" },
					{ "views", "%a.viewscount" },
					{ "bandwidth", "%a.?" },
					{ "creation-year", "EXTRACT(YEAR FROM %a.creationdate)" },
					{ "creation-date", "%a.creationdate" },
					{ "edit-year", "EXTRACT(YEAR FROM %a.modificationdate)" },
					{ "edit-date", "%a.modificationdate" },
					{ "update-count", "%a.dataversion" },
				}
			},
		
			{
				"series",
				new Dictionary<string, string>
				{
					{ "name", "%a.name" },
					{ "creation-year", "EXTRACT(YEAR FROM %a.creationdate)" },
					{ "creation-date", "%a.creationdate" },
					{ "edit-year", "EXTRACT(YEAR FROM %a.modificationdate)" },
					{ "edit-date", "%a.modificationdate" },
					{ "sharing", "%a.sharing" }
				}
			},
		
			{
				"users",
				new Dictionary<string, string>
				{
					{ "name", "%a.displayname" },
					{ "url-name", "%a.urlname" },
					{ "reg-year", "EXTRACT(YEAR FROM %a.?)" },
					{ "reg-date", "%a.?" },
					{ "last-act", "%a.?" },
					{ "pay-exp", "%a.?" },
					{ "traffic", "%a.?" },
				}
			}
		};

		#endregion

		public static string GetQuery(InquiryRequest req)
		{
			var data = new InquiryData(req.InquiryType);

			ProcessGroups(req.Groups, data, data.Alias);
			ProcessConditions(req.Conditions, data, data.Alias);

			return BuildQuery(data);
		}

		private static void ProcessGroups(IEnumerable<string> groups, InquiryData data, string alias)
		{
			if (groups == null)
				return;

			foreach (var group in groups)
			{
				var col = group.Replace("-", "_");
				data.Groups.Add(col);

				data.Columns.Add(
					new Column(
						Lookup(group, FieldMappings[data.Type]).Replace("%a", alias),
						group
					)
				);
			}
		}

		private static void ProcessConditions(IEnumerable<InquiryCondition> conds, InquiryData data, string alias)
		{
			if (conds == null)
				return;

			foreach (var cond in conds)
				ProcessCondition(cond, data, alias);
		}

		private static void ProcessCondition(InquiryCondition cond, InquiryData data, string alias)
		{
			if (cond.Kind == "field")
			{
				data.Conditions.Add(ProcessExpression(cond, data.Type, alias));
				return;
			}

			var rel = Lookup(cond.Id, RelationMappings);
			var newAlias = GetAlias(rel.Target);

			if (!IsMultiRelation(cond.Id))
			{
				var condition = GetKeyBinding(rel, alias, newAlias);
				data.Joins.Add(new Join(rel.Target, newAlias, condition));
				ProcessConditions(cond.Subs, data, newAlias);
			}
			else
			{
				var subData = new InquiryData(rel.Target);
				ProcessConditions(cond.Subs, subData, subData.Alias);
				subData.Conditions.Add(GetKeyBinding(rel, alias, subData.Alias));

				var col = rel.PrimaryKey.Replace("-", "_");
				subData.Columns.Add(new Column(rel.PrimaryKey, col));
				subData.Groups.Add(col);

				var expr = BuildQuery(subData);
				var condition = GetKeyBinding(rel, alias, newAlias);
				data.Joins.Add(new Join("(" + expr + ")", newAlias, condition));

				data.Conditions.Add(ProcessExpressionBase(cond, newAlias + ".count"));
			}
		}

		private static string ProcessExpression(InquiryCondition cond, string type, string alias)
		{
			var name = Lookup(cond.Id, FieldMappings[type]).Replace("%a", alias);
			return ProcessExpressionBase(cond, name);
		}

		private static string ProcessExpressionBase(InquiryCondition cond, string field)
		{
			var op = Lookup(cond.Operator, OperatorMappings);

			if (cond.Operator.EndsWith("contains"))
				cond.Value = cond.Value.Replace("%", "%%");

			return string.Format(op, field, cond.Value ?? "", cond.From ?? "", cond.To ?? "");
		}

		private static string GetKeyBinding(Relation rel, string alias, string newAlias)
		{
			return string.Format(
				"{0}.{1} = {2}.{3}",
				alias,
				rel.ForeignKey,
				newAlias,
				rel.PrimaryKey
			);
		}

		private static string BuildQuery(InquiryData data)
		{
			var sb = new StringBuilder();
			data.Columns.Add(new Column("COUNT(*)", "count"));
			var columns = from c in data.Columns select string.Format("{0} AS {1}", c.Expression, c.Alias);

			sb.AppendFormat(
				"SELECT {0} FROM {1} AS {2}",
				string.Join(", ", columns),
				Lookup(data.Type, InquiryMappings),
				data.Alias
			);

			foreach (var curr in data.Joins)
			{
				sb.AppendFormat(
					" JOIN {0} AS {1} ON {2}",
					curr.Table,
					curr.Alias,
					curr.Condition
				);
			}

			if (data.Conditions.Count > 0)
			{
				sb.Append(" WHERE ");
				AppendTo(sb, data.Conditions, " AND ");
			}

			if (data.Groups.Count > 0)
			{
				sb.Append(" GROUP BY ");
				var groups = from g in data.Groups select string.Format("{0}.{1}", data.Alias, g);
				AppendTo(sb, groups, ", ");
			}

			return sb.ToString();
		}

		private static bool IsMultiRelation(string id)
		{
			return new[] { "user-books", "user-series" }.Contains(id);
		}

		private static T Lookup<T>(string key, IReadOnlyDictionary<string, T> lookup)
		{
			T result;
			if (!lookup.TryGetValue(key, out result))
				throw new ArgumentException(string.Format("Invalid key: {0}", key));

			return result;
		}

		private static void AppendTo(StringBuilder sb, IEnumerable<string> data, string delim)
		{
			var first = true;
			foreach (var curr in data)
			{
				if (first)
					first = false;
				else
					sb.Append(delim);
				sb.Append(curr);
			}
		}

		private static int AliasId;
		public static string GetAlias(string table)
		{
			var alias = table[0] + AliasId.ToString();
			AliasId++;
			return alias;
		}
	}
}
