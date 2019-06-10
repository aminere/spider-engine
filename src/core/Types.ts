
type IfEquals<X, Y, A = X, B = never> =
    (<T>() => T extends X ? 1 : 0) extends
    (<T>() => T extends Y ? 1 : 0) ? A : B;

type WritableProperties<T> = {
    [P in keyof T]-?: IfEquals<
        { [Q in P]: T[P] },
        { -readonly [Q in P]: T[P] },
        P
    >
}[keyof T];

export type ObjectProps<T> = Partial<Pick<T, WritableProperties<T>>>;

// tslint:disable-next-line
export type Constructor<T> = new (...args: any[]) => T;
