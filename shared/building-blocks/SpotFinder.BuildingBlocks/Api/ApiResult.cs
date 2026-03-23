namespace SpotFinder.BuildingBlocks.Api;

/// <summary>
/// Standard Phase-3 response envelope: { isSuccess, data, errors }
/// </summary>
public sealed record ApiResult<T>
{
    public bool IsSuccess { get; init; }
    public T? Data { get; init; }
    public IReadOnlyList<string> Errors { get; init; } = [];

    public static ApiResult<T> Ok(T data) =>
        new() { IsSuccess = true, Data = data, Errors = [] };

    public static ApiResult<T> Fail(params string[] errors) =>
        new() { IsSuccess = false, Data = default, Errors = errors };
}
