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
	public string Kind;
	public string Field;
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
	
	private Dictionary<string, string> RelationMappings = new Dictionary<string, string>
	{
		{ "books", "content_profile" },
		{ "users", "users" },
		{ "series", "series" }
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
		var conditions = new List<string>();
		var joins = new List<Tuple<string, string>>();
		var groups = new List<string>();
		
		var table = Lookup(req.InquiryType, RelationMappings);
		
		return BuildQuery(table, conditions, joins, groups);
	}
	
	private string BuildQuery(string table, ICollection<string> conditions, ICollection<Tuple<string, string>> joins, ICollection<string> groups)
	{
		var sb = new StringBuilder();
		var fields = groups.Concat(new [] { "COUNT(*)" });
		sb.AppendFormat(
			"SELECT {0} FROM {1}", 
			string.Join(", ", fields),
			table
		);
		
		foreach(var curr in joins)
			sb.AppendFormat(
				" LEFT JOIN {0} ON {1}",
				curr.Item1,
				curr.Item2
			);
			
		if(conditions.Count > 0)
		{
			sb.Append(" WHERE ");
			AppendTo(sb, conditions, " AND ");
		}
		
		if(groups.Count > 0)
		{
			sb.Append(" GROUP BY ");
			AppendTo(sb, groups, ", ");
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
}