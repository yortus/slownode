export = EventLoopEntry;


interface EventLoopEntry {
    $slow: {
        due: number;
        callback: Function;
        arguments: any[];
    };
}
