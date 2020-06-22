// file: examples/example_C.ts
import {CxGraph, Node} from '../mod.ts'

 let g = new CxGraph()
 g.addNode( new Node('A') ) 
 g.addNode( new Node('B') )
 g.addNode( new Node('C', 'C-Node') )
 g.addNode( new Node('D', ['D-0', 'D-1']) )
 g.addNode( new Node('E', { type: 'Object'}) )
 g.addNode( new Node('F') )
 g.addNode( new Node('G') )
 g.addNode( new Node('H') )
 g.addNode( new Node('I') )
 g.addNode( new Node('J') )
   
 g.addDependency('A', 'C')
 g.addDependency('B', 'D')
 g.addDependency('B', 'E')
 g.addDependency('C', 'F')
 g.addDependency('C', 'G')
 g.addDependency('G', 'H')
 g.addDependency('H', 'I')
 g.addDependency('E', 'I')
 
let hierarKeyRep: Map<string,string>[] = g.hierarchyOfDependants('I')
console.log(hierarKeyRep)
