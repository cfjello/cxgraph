// file: examples/example_A.ts
import {CxGraph, Node} from '../mod.ts'

let g = new CxGraph()
g.addNode( new Node('A') )  
g.addNode( new Node('B') )

// Set some data 
g.addNode( new Node('C', 'C-Node') )
g.addNode( new Node('D', ['D-0', 'D-1']) )
g.addNode( new Node('E', { type: 'Object'}) )
g.addNode( new Node('F') )

// Modify the data for node A
class A_Class { 
    constructor ( public i: number = 1 ) {}
}
let a = new A_Class()
g.setNodeData('A', a)
g.addNode( new Node('G') )
g.addNode( new Node('H') )
g.addNode( new Node('I') )
g.addNode( new Node('J') )

// Add the dependencies
g.addDependency('A', 'B')
g.addDependency('A', 'C')
g.addDependency('A', 'J')
g.addDependency('B', 'D')
g.addDependency('B', 'E')
g.addDependency('C', 'F')
g.addDependency('C', 'G')
g.addDependency('G', 'H')
g.addDependency('E', 'I')


console.log('Show the dependencies of node C:')
console.log( g.dependenciesOf('C') ) 

console.log('Show the overall graph from leafs to top node(s):')
console.log( g.overallOrder() )

console.log('Show the hierarchy of the graph from the top node A:')
let map: Map<string,string> = g.hierarchyOf('A') 

map.forEach( ( value, key ) => {
    console.log ( `${value}: ${key}` ) 
})

console.log('Show the hierarchy graph in reverse order:')
let mapReverse: Map<string,string> = g.hierarchyOf('A', true, 4) 

mapReverse.forEach( ( value, key ) => {
    console.log ( `${value}: ${key}` ) 
})


