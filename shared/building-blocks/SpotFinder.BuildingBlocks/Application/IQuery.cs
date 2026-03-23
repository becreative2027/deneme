using MediatR;
namespace SpotFinder.BuildingBlocks.Application;
public interface IQuery<out TResponse> : IRequest<TResponse> { }
