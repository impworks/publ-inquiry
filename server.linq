<Query Kind="Program" />

void Main()
{
	
}

public class InquiryRequest
{
	public string InquiryType;
	public string[] Groups;
	public InquiryCondition[] Conditions;
}

public class InquiryCondition
{
	public string Id;
	public string Kind;
	public string Operator;
	public string Value;
	public string From;
	public string To;
	public InquiryCondition[] Subs;
}

public static class Tests
{
	public static InquiryRequest BooksBasic = new InquiryRequest
	{
		InquiryType = "books"
	};
	
	public static InquiryRequest BooksCond1 = new InquiryRequest
	{
		InquiryType = "books",
		Conditions = new []
		{
			new InquiryCondition
			{
				
			}
		}
	};
}

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
		
		public Join(string table, string cond)
		{
			Table = table;
			Alias = InquiryBuilder.GetAlias(table);
			Condition = cond;
		}
	}
	
	private class InquiryData
	{
		public string Table;
		public string Alias;
		
		public readonly List<string> Conditions = new List<string>();
		public readonly List<Join> Joins = new List<Join>();
		public readonly List<string> Groups = new List<string>();
		
		public InquiryData(string table)
		{
			Table = table;
			Alias = InquiryBuilder.GetAlias(table);
		}
	}
	
	#endregion

	#region Lookups
	
	// Replace rules:
	// %c = column
	// %v = value
	// %f = from
	// %t = to
	private Dictionary<string, string> OperatorMappings = new Dictionary<string, string>
	{
		{ "equals", "%c = %v" },
		{ "not-equals", "%c <> %v" },
		{ "null", "%c IS NULL" },
		{ "not-null", "%c IS NOT NULL" },
		{ "true", "%с = true" },
		{ "not-true", "%с = false" },
		{ "greater", "%с > %v" },
		{ "not-greater", "%с < %v" },
		{ "between", "%с BETWEEN %f AND %t" },
		{ "not-between", "%с NOT BETWEEN %f AND %t" },
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
		{ "book-creator", new Relation("users", "id", "creator_id") }
	};
	
	private Dictionary<string, Dictionary<string, string>> FieldMappings = new Dictionary<string, Dictionary<string, string>>
	{
		{
			"books",
			new Dictionary<string, string>
			{
				{ "name", "name" },
				{ "descr", "?" },
				{ "access-type", "accesstype" },
				{ "state", "state" },
				{ "size", "size" },
				{ "pages", "pagescount" },
				{ "views", "viewscount" },
				{ "bandwidth", "?" },
				{ "creation-year", "EXTRACT(YEAR FROM creationdate)" },
				{ "creation-date", "creationdate" },
				{ "edit-year", "EXTRACT(YEAR FROM modificationdate)" },
				{ "edit-date", "modificationdate" },
				{ "update-count", "dataversion" },
			}
		},
		
		{
			"series",
			new Dictionary<string, string>
			{
				{ "name", "name" },
				{ "creation-year", "EXTRACT(YEAR FROM creationdate)" },
				{ "creation-date", "creationdate" },
				{ "edit-year", "EXTRACT(YEAR FROM modificationdate)" },
				{ "edit-date", "modificationdate" },
				{ "sharing", "sharing" }
			}
		},
		
		{
			"users",
			new Dictionary<string, string>
			{
				{ "name", "displayname" },
				{ "url-name", "urlname" },
				{ "reg-year", "EXTRACT(YEAR FROM ?)" },
				{ "reg-date", "?" },
				{ "last-act", "?" },
				{ "pay-exp", "?" },
				{ "traffic", "?" },
			}
		}
	};
	#endregion
	
	public string GetQuery(InquiryRequest req)
	{
		var table = Lookup(req.InquiryType, InquiryMappings);
		var data = new InquiryData(table);
		
		return BuildQuery(data);
	}
	
	private string BuildQuery(InquiryData data)
	{
		var sb = new StringBuilder();
		var fields = data.Groups.Concat(new [] { "COUNT(*)" });
		sb.AppendFormat(
			"SELECT {0} FROM {1} AS {2}", 
			string.Join(", ", fields),
			data.Table,
			data.Alias
		);
		
		foreach(var curr in data.Joins)
			sb.AppendFormat(
				" LEFT JOIN {0} AS {1} ON {2}",
				curr.Table,
				curr.Alias,
				curr.Condition
			);
			
		if(data.Conditions.Count > 0)
		{
			sb.Append(" WHERE ");
			AppendTo(sb, data.Conditions, " AND ");
		}
		
		if(data.Groups.Count > 0)
		{
			sb.Append(" GROUP BY ");
			AppendTo(sb, data.Groups, ", ");
		}
		
		return sb.ToString();
	}
	
	private bool IsMultiRelation(string id)
	{
		return new [] { "book-series", "users-books", "users-series", "series-books" }.Contains(id);
	}
	
	private string Lookup(string key, Dictionary<string, string> lookup)
	{
		string result;
		if(!lookup.TryGetValue(key, out result))
			throw new ArgumentException(string.Format("Invalid key: {0}", key));
			
		return result;
	}
	
	private void AppendTo(StringBuilder sb, IEnumerable<string> data, string delim)
	{
		bool first = true;
		foreach(var curr in data)
		{
			if(first)
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