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

		private class OneToManyRelation : Relation
		{
			public OneToManyRelation(string target, string pk, string fk) : base(target, pk, fk)
			{ }
		}

		private class ManyToManyRelation : Relation
		{
			public readonly string Lookup;
			public readonly string PrimaryKey2;
			public readonly string ForeignKey2;

			public ManyToManyRelation(string target, string lookup, string pk1, string fk1, string pk2, string fk2)
				: base(target, pk1, fk1)
			{
				Lookup = lookup;
				PrimaryKey2 = pk2;
				ForeignKey2 = fk2;
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
			{ "equals", "{0} = '{1}'" },
			{ "not-equals", "{0} <> '{1}'" },
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
			{ "series-owner", new Relation("users", "id", "owner_id") },
			{ "user-books", new OneToManyRelation("books", "author_id", "id") },
			{ "user-series", new OneToManyRelation("series", "owner_id", "id") },
			{ "book-series", new ManyToManyRelation("series", "bookstoseries", "id", "book_id", "id", "series_id") },
			{ "series-books", new ManyToManyRelation("books", "bookstoseries", "id", "series_id", "id", "book_id") },
		};

		private static readonly Dictionary<string, Dictionary<string, string>> FieldMappings = new Dictionary<string, Dictionary<string, string>>
		{
			{
				"books",
				new Dictionary<string, string>
				{
					{ "name", "{0}.name" },
					{ "descr", "{0}.description" },
					{ "access-type", "{0}.accesstype" },
					{ "state", "{0}.status" },
					{ "size", "{0}.size" },
					{ "pages", "{0}.pagescount" },
					{ "views", "{0}.viewscount" },
					{ "bandwidth", "{0}.bandwidthused" },
					{ "creation-year", "EXTRACT(YEAR FROM {0}.creationdate)" },
					{ "creation-date", "{0}.creationdate" },
					{ "edit-year", "EXTRACT(YEAR FROM {0}.modificationdate)" },
					{ "edit-date", "{0}.modificationdate" },
					{ "update-count", "{0}.dataversion" },
				}
			},
		
			{
				"series",
				new Dictionary<string, string>
				{
					{ "name", "{0}.name" },
					{ "creation-year", "EXTRACT(YEAR FROM {0}.creationdate)" },
					{ "creation-date", "{0}.creationdate" },
					{ "edit-year", "EXTRACT(YEAR FROM {0}.modificationdate)" },
					{ "edit-date", "{0}.modificationdate" },
					{ "sharing", "{0}.sharing" }
				}
			},
		
			{
				"users",
				new Dictionary<string, string>
				{
					{ "name", "{0}.displayname" },
					{ "url-name", "{0}.urlname" },
					{ "reg-year", "EXTRACT(YEAR FROM {0}.registrationdate)" },
					{ "reg-date", "{0}.registrationdate" },
					{ "last-act", "{0}.lastlogon" },
					{ "pay-exp", "{0}.paymentexpiration" },
					{ "traffic", "{0}.trafficleft" },
				}
			}
		};

		private static Dictionary<string, string> HeaderMapping = new Dictionary<string, string>
		{
			{ "access-type", "Access Type" },
			{ "state", "State" },
			{ "creation-year", "Creation Year" },
			{ "quota", "Publ Quota" },
			{ "reg-year", "Registration Year" },
			{ "exp-year", "Expiration Year" },
		};

		#endregion

		public static InquiryResponse GetReponse(InquiryRequest req)
		{
			return new InquiryResponse
			{
				Query = GetQuery(req),
				Headers = GetHeaders(req)
			};
		}

		private static string[] GetHeaders(InquiryRequest req)
		{
			return req.Groups.Select(x => Lookup(x, HeaderMapping)).ToArray();
		}

		public static string GetQuery(InquiryRequest req)
		{
			var data = new InquiryData(req.InquiryType);

			ProcessGroups(req.Groups, data, data.Alias);
			ProcessConditions(req.Conditions, data, data.Type, data.Alias);

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
						string.Format(Lookup(group, FieldMappings[data.Type]), alias),
						col
					)
				);
			}
		}

		private static void ProcessConditions(IEnumerable<InquiryCondition> conds, InquiryData data, string type, string alias)
		{
			if (conds == null)
				return;

			foreach (var cond in conds)
				ProcessCondition(cond, data, type, alias);
		}

		private static void ProcessCondition(InquiryCondition cond, InquiryData data, string type, string alias)
		{
			if (cond.Kind == "field")
			{
				data.Conditions.Add(ProcessExpression(cond, type, alias));
				return;
			}

			var rel = Lookup(cond.Id, RelationMappings);
			var newAlias = GetAlias(rel.Target);

			if (rel is ManyToManyRelation)
			{
				var mtmr = rel as ManyToManyRelation;
				var subData = new InquiryData(mtmr.Target);
				ProcessConditions(cond.Subs, subData, mtmr.Target, subData.Alias);

				var listCond = string.Format(
					"{0}.{1} IN (SELECT {2} FROM {3} AS {4} WHERE {4}.{5} = {6}.{7})",
					subData.Alias,
					mtmr.PrimaryKey2,
					mtmr.ForeignKey2,
					mtmr.Lookup,
					GetAlias(mtmr.Lookup),
					mtmr.ForeignKey,
					alias,
					mtmr.PrimaryKey
				);
				subData.Conditions.Add(listCond);

				var expr = BuildQuery(subData);
				data.Conditions.Add(ProcessExpressionBase(cond, "(" + expr + ")"));
			}
			else if (rel is OneToManyRelation)
			{
				var subData = new InquiryData(rel.Target);
				ProcessConditions(cond.Subs, subData, rel.Target, subData.Alias);

				var col = rel.PrimaryKey.Replace("-", "_");
				subData.Columns.Add(new Column(rel.PrimaryKey, col));
				subData.Groups.Add(col);

				var expr = BuildQuery(subData);
				var condition = GetKeyBinding(rel, alias, newAlias);
				data.Joins.Add(new Join("(" + expr + ")", newAlias, condition));

				data.Conditions.Add(ProcessExpressionBase(cond, newAlias + ".count"));
			}
			else
			{
				var condition = GetKeyBinding(rel, alias, newAlias);
				data.Joins.Add(new Join(rel.Target, newAlias, condition));
				ProcessConditions(cond.Subs, data, rel.Target, newAlias);
			}
		}

		private static string ProcessExpression(InquiryCondition cond, string type, string alias)
		{
			var name = string.Format(Lookup(cond.Id, FieldMappings[type]), alias);
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
			data.Columns.Add(new Column("COUNT(*)", "count"));

			var sb = new StringBuilder();
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
				AppendTo(sb, data.Groups, ", ");
			}

			return sb.ToString();
		}

		private static T Lookup<T>(string key, IDictionary<string, T> lookup)
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
		public static string GetAlias(string id)
		{
			var alias = id[0] + AliasId.ToString();
			AliasId++;
			return alias;
		}
	}
}
