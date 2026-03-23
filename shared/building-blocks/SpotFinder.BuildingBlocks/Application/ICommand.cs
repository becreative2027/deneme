using MediatR;
namespace SpotFinder.BuildingBlocks.Application;
public interface ICommand : IRequest { }
public interface ICommand<out TResponse> : IRequest<TResponse> { }
