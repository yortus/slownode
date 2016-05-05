if (a < 3 * 33) {
	111
}
else {
	222
}


var program = `
switch (pc) {
    case 0:     push("a");      } ⟓
    case 1:     get();           |
    case 2:     push(3);         /⋈⋙
    case 3:     push(33);       
    case 4:     calli2('*');    
    case 5:     calli2('<');    
    case 6:     bf(10);         
    case 7:     push(111);      
    case 8:     pop();          
    case 9:     br(10);         
    case 10:    push(222);      
    case 11:    pop();          
}
`;