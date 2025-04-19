// Sulaf's API key: "6830e69e039c3501e31de8a68ef16034f32ee869"
// Anthony's API key: "feba906125b0a26a70a44be3a55b670d4f552c74"

namespace Env
{
    public static class EnvConfig
    {
        public static string UnwrangleApiKey =>
            Environment.GetEnvironmentVariable("6830e69e039c3501e31de8a68ef16034f32ee869")
            ?? "f3475d4023f0f529221e4e32025b23282bd713c0";
        //?? "feba906125b0a26a70a44be3a55b670d4f552c74";

        public static string connectionString =>
            Environment.GetEnvironmentVariable("mongodb+srv://williamfugate:rQNXj0wUb0GuzJwh@user-info.111hyzz.mongodb.net/?retryWrites=true&w=majority&appName=user-info");

    }
}