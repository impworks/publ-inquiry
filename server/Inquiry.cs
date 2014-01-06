namespace PublInquiryServer
{
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
}
