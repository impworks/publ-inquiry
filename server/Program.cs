namespace PublInquiryServer
{
	class Program
	{
		static void Main()
		{
			InquiryBuilder.GetQuery(Tests.BookSeries2).Dump();
		}
	}
}
