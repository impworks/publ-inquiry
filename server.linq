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
				Field = 
			}
		}
	};
}

public class InquiryBuilder
{
	public string GetQuery(InquiryRequest req)
	{
		return null;
	}
	
	public bool IsMultiRelation(string id)
	{
		return new [] { "book-series", "users-books", "users-series", "series-books" }.Contains(id);
	}
}