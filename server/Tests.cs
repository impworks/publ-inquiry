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

		public static InquiryRequest User1 = new InquiryRequest
		{
			InquiryType = "users",
			Conditions = new []
			{
				new InquiryCondition
				{
					Kind = "field",
					Id = "name",
					Operator = "not-contains",
					Value = "guest"
				}
			}
		};

		public static InquiryRequest UserBooks1 = new InquiryRequest
		{
			InquiryType = "users",
			Conditions = new[]
			{
				new InquiryCondition
				{
					Kind = "field",
					Id = "name",
					Operator = "not-contains",
					Value = "test"
				},

				new InquiryCondition
				{
					Kind = "relation",
					Id = "user-books",
					Operator = "between",
					From = "10",
					To = "20"
				}
			}
		};

		public static InquiryRequest UserBooks2 = new InquiryRequest
		{
			InquiryType = "users",
			Conditions = new[]
			{
				new InquiryCondition
				{
					Kind = "field",
					Id = "name",
					Operator = "not-contains",
					Value = "test"
				},

				new InquiryCondition
				{
					Kind = "relation",
					Id = "user-books",
					Operator = "between",
					From = "10",
					To = "20",
					Subs = new []
					{
						new InquiryCondition
						{
							Kind = "field",
							Id = "state",
							Operator = "equals",
							Value = "Public"
						}
					}
				}
			}
		};

		public static InquiryRequest BookSeries1 = new InquiryRequest
		{
			InquiryType = "books",
			Conditions = new []
			{
				new InquiryCondition
				{
					Kind = "field",
					Id = "bandwidth",
					Operator = "between",
					From = "100000",
					To = "200000"
				},

				new InquiryCondition
				{
					Kind = "relation",
					Id = "book-series",
					Operator = "greater",
					Value = "10"
				}
			}
		};

		public static InquiryRequest BookSeries2 = new InquiryRequest
		{
			InquiryType = "books",
			Conditions = new[]
			{
				new InquiryCondition
				{
					Kind = "field",
					Id = "bandwidth",
					Operator = "between",
					From = "100000",
					To = "200000"
				},

				new InquiryCondition
				{
					Kind = "relation",
					Id = "book-series",
					Operator = "not-greater",
					Value = "10",
					Subs = new []
					{
						new InquiryCondition
						{
							Kind = "field",
							Id = "sharing",
							Operator = "equals",
							Value = "Public"
						}
					}
				}
			}
		};
	}
}
