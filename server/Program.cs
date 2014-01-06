namespace PublInquiryServer
{
	class Program
	{
		static void Main()
		{
			var ib = new InquiryBuilder();
			ib.GetQuery(Tests.BooksGroup).Dump();
		}
	}
}
