using System;
using System.Globalization;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading.Tasks;
using System.Web.Script.Serialization;
using Windows.ApplicationModel;
using Windows.Services.Store;

internal static class StoreLicense
{
    private const string ProductId = "9PGRQHQ6GQKV";
    private const string IdentityName = "Ilcodicedidante.MOVARISCH";

    [DllImport("kernel32.dll", CharSet = CharSet.Unicode)]
    private static extern int GetCurrentPackageFullName(ref uint length, StringBuilder name);

    [ComImport, Guid("3E68D4BD-7135-4D10-8018-9FB6D9F33FA1"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
    private interface IInitializeWithWindow { void Initialize(IntPtr hwnd); }

    [STAThread]
    private static int Main(string[] args)
    {
        try
        {
            uint length = 0;
            if (GetCurrentPackageFullName(ref length, null) != 122 || length == 0)
                return Write(new { state = "not-store", productId = ProductId });
            if (!String.Equals(Package.Current.Id.Name, IdentityName, StringComparison.Ordinal))
                return Write(new { state = "wrong-package", productId = ProductId });
            long handle;
            if (args.Length != 1 || !Int64.TryParse(args[0], NumberStyles.None, CultureInfo.InvariantCulture, out handle) || handle <= 0)
                return Write(new { state = "unavailable", productId = ProductId });
            StoreContext context = StoreContext.GetDefault();
            ((IInitializeWithWindow)(object)context).Initialize(new IntPtr(handle));
            return ReadLicense(context).GetAwaiter().GetResult();
        }
        catch (Exception error)
        {
            return Write(new { state = "unavailable", productId = ProductId, errorCode = error.HResult.ToString("X8") });
        }
    }

    private static async Task<int> ReadLicense(StoreContext context)
    {
        // Windows caches Store entitlements for offline use; no custom persisted "licensed" flag.
        StoreAppLicense license = await context.GetAppLicenseAsync();
        bool matchingProduct = !String.IsNullOrEmpty(license.SkuStoreId) &&
            (String.Equals(license.SkuStoreId, ProductId, StringComparison.OrdinalIgnoreCase) ||
             license.SkuStoreId.StartsWith(ProductId + "/", StringComparison.OrdinalIgnoreCase));
        return Write(new {
            state = matchingProduct && license.IsActive && !license.IsTrial ? "licensed" : "unlicensed",
            productId = ProductId,
            isTrial = license.IsTrial
        });
    }

    private static int Write(object result)
    {
        Console.OutputEncoding = new UTF8Encoding(false);
        Console.WriteLine(new JavaScriptSerializer().Serialize(result));
        return 0;
    }
}
