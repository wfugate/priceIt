

namespace Env
{
    public static class EnvConfig
    {
        public static string UnwrangleApiKey =>
            Environment.GetEnvironmentVariable("UNWRANGLE_KEY");


    }
}