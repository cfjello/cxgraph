// file: examples/example_B.ts
import {CxGraph, Node} from '../mod.ts'

let g = new CxGraph()

class DateClass {    
    constructor (  public date: Date = new Date('2017-07-14 11:45:00')  ) {}
}

let node = new Node<DateClass>('A', new DateClass() )

g.addNode(node)

console.log( g.getNodeData<DateClass>('A').date)
