using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;

namespace Payment.Helper;

internal class TextHelper
{
    public static string NormalizeOrderInfo(string input)
    {
        string normalized = input.Normalize(NormalizationForm.FormD);
        var chars = normalized.Where(c => CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark);
        normalized = new string(chars.ToArray()).Normalize(NormalizationForm.FormC);

        normalized = Regex.Replace(normalized, @"[^a-zA-Z0-9\s\.,]", "");

        if (normalized.Length > 255)
        {
            normalized = normalized.Substring(0, 255);
        }

        return normalized;
    }
}
