using System;
using System.IO;

namespace PublInquiryServer
{
	public static class Help
	{
		public static void Dump(this object obj)
		{
			var data = obj == null
				? "(null)"
				: obj.ToString();

			using(var fs = new FileStream("log.sql", FileMode.Append, FileAccess.Write))
			using(var sr = new StreamWriter(fs))
				sr.WriteLine(data);

			Console.WriteLine(data);
			Console.ReadKey(false);
		}
	}
}
