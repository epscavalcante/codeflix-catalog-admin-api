export default interface IUseCase<Input, Output> {
    handle(input: Input): Promise<Output>;
}
