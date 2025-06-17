using System.Net.Sockets;
using System.Net;

namespace AIGenVideo.Server.Helpers;

public static class IpAddressHelper
{
    public static string? GetServerIp()
    {
        var host = Dns.GetHostEntry(Dns.GetHostName());
        foreach (var ip in host.AddressList)
        {
            if (ip.AddressFamily == AddressFamily.InterNetwork && !IPAddress.IsLoopback(ip))
            {
                return ip.ToString(); // Trả về IP như 192.168.1.10
            }
        }
        return null;
    }
}
