namespace PublInquiryServer
{
	public static class Tests
	{
		public static InquiryRequest BooksBasic = new InquiryRequest
		{
			InquiryType = "books"
		};

		public static InquiryRequest BooksGroup = new InquiryRequest
		{
			InquiryType = "books",
			Groups = new[]
			{
				"access-type",
				"creation-year"
			}
		};

		public static InquiryRequest BooksCond1 = new InquiryRequest
		{
			InquiryType = "books",
			Conditions = new[]
			{
				new InquiryCondition
				{
					Kind = "field",
					Id = "views",
					Operator = "equals",
					Value = "5"
				}
			}
		};

		public static InquiryRequest BooksCond2 = new InquiryRequest
		{
			InquiryType = "books",
			Conditions = new[]
			{
				new InquiryCondition
				{
					Kind = "field",
					Id = "creation-year",
					Operator = "not-between",
					From = "2010",
					To = "2013"
				},

				new InquiryCondition
				{
					Kind = "field",
					Id = "descr",
					Operator = "contains",
					Value = "test"
				},
			}
		};

		public static InquiryRequest BooksOwner = new InquiryRequest
		{
			InquiryType = "books",
			Conditions = new[]
			{
				new InquiryCondition
				{
					Kind = "field",
					Id = "creation-year",
					Operator = "not-between",
					From = "2010",
					To = "2013"
				},

				new InquiryCondition
				{
					Kind = "relation",
					Id = "book-owner",
					Subs = new []
					{
						new InquiryCondition
						{
							Kind = "field",
							Id = "name",
							Operator = "equals",
							Value = "test"
						}
					}
				},
			}
		};
	}
}
