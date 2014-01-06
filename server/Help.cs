using System;

namespace PublInquiryServer
{
	public static class Help
	{
		public static void Dump(this object obj)
		{
			Console.WriteLine(
				obj == null
					? "(null)"
					: obj.ToString()
			);

			Console.ReadKey(true);
		}
	}
}
