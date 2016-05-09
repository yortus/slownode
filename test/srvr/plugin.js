define([], () => ({
    visitor: {
        Identifier(path) {
            path.node.name = path.node.name.split('').reverse().join('');
        }
    }
}));
