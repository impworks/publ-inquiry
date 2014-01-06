using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace PublInquiryServer
{
	public class InquiryBuilder
	{
		#region Subclasses

		private class Relation
		{
			public readonly string Table;
			public readonly string PrimaryKey;
			public readonly string ForeignKey;

			public Relation(string table, string pk, string fk)
			{
				Table = table;
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
		// %n = column
		// %v = value
		// %f = from
		// %t = to
		private Dictionary<string, string> OperatorMappings = new Dictionary<string, string>
		{
			{ "equals", "%n = %v" },
			{ "not-equals", "%n <> %v" },
			{ "null", "%n IS NULL" },
			{ "not-null", "%n IS NOT NULL" },
			{ "true", "%n = true" },
			{ "not-true", "%n = false" },
			{ "greater", "%n > %v" },
			{ "not-greater", "%n < %v" },
			{ "contains", "%n LIKE '%%v%'" },
			{ "not-contains", "%n NOT LIKE '%%v%'" },
			{ "between", "%n BETWEEN %f AND %t" },
			{ "not-between", "%n NOT BETWEEN %f AND %t" },
		};

		private Dictionary<string, string> InquiryMappings = new Dictionary<string, string>
		{
			{ "books", "content_profile" },
			{ "users", "users" },
			{ "series", "series" }
		};

		private Dictionary<string, Relation> RelationMappings = new Dictionary<string, Relation>
		{
			{ "book-owner", new Relation("users", "id", "author_id") },
			{ "book-creator", new Relation("users", "id", "creator_id") },
			{ "series-owner", new Relation("users", "id", "?") },
		};

		private Dictionary<string, Dictionary<string, string>> FieldMappings = new Dictionary<string, Dictionary<string, string>>
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

		public string GetQuery(InquiryRequest req)
		{
			var data = new InquiryData(req.InquiryType);

			ProcessGroups(req.Groups, data, data.Alias);
			ProcessConditions(req.Conditions, data, data.Alias);

			return BuildQuery(data);
		}

		private void ProcessGroups(IEnumerable<string> groups, InquiryData data, string alias)
		{
			foreach (var group in groups)
			{
				var col = group.Replace("-", "_");
				data.Groups.Add(col);

				data.Columns.Add(
					new Column(
						Lookup(group, FieldMappings[data.Type]).Replace("%a", alias),
						col
					)
				);
			}
		}

		private void ProcessConditions(IEnumerable<InquiryCondition> conds, InquiryData data, string alias)
		{
			if (conds == null)
				return;

			foreach (var cond in conds)
			{
				if (cond.Kind == "field")
				{
					data.Conditions.Add(ProcessExpression(cond, data.Type, alias));
				}
				else
				{
					if (IsMultiRelation(cond.Id))
						throw new NotImplementedException("TODO");

					var rel = Lookup(cond.Id, RelationMappings);
					var newAlias = GetAlias(rel.Table);
					var condition = string.Format(
						"{0}.{1} = {2}.{3}",
						alias,
						rel.ForeignKey,
						newAlias,
						rel.PrimaryKey
					);

					data.Joins.Add(new Join(rel.Table, newAlias, condition));

					ProcessConditions(cond.Subs, data, newAlias);
				}
			}
		}

		private string ProcessExpression(InquiryCondition cond, string type, string alias)
		{
			var name = Lookup(cond.Id, FieldMappings[type]).Replace("%a", alias);
			var op = Lookup(cond.Operator, OperatorMappings);

			return op.Replace("%n", name)
					 .Replace("%v", cond.Value ?? "")
					 .Replace("%f", cond.From ?? "")
					 .Replace("%t", cond.To ?? "");
		}

		private string BuildQuery(InquiryData data)
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
				sb.AppendFormat(
					" JOIN {0} AS {1} ON {2}",
					curr.Table,
					curr.Alias,
					curr.Condition
				);

			if (data.Conditions.Count > 0)
			{
				sb.Append(" WHERE ");
				AppendTo(sb, data.Conditions, " AND ");
			}

			if (data.Groups.Count > 0)
			{
				sb.Append(" GROUP BY ");
				AppendTo(sb, data.Groups, ", ");
			}

			return sb.ToString();
		}

		private bool IsMultiRelation(string id)
		{
			return new[] { "book-series", "users-books", "users-series", "series-books" }.Contains(id);
		}

		private T Lookup<T>(string key, Dictionary<string, T> lookup)
		{
			T result;
			if (!lookup.TryGetValue(key, out result))
				throw new ArgumentException(string.Format("Invalid key: {0}", key));

			return result;
		}

		private void AppendTo(StringBuilder sb, IEnumerable<string> data, string delim)
		{
			bool first = true;
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
