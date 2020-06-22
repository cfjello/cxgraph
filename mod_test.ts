import {CxGraph, Node} from './mod.ts'
import { expect }  from 'https://deno.land/x/expect/mod.ts'

// describe('Node data can have a type', () => {
    Deno.test('A Node class.data object should be of javascript type object', () => { 
        class A_Class { 
            constructor ( public i: number = 1 ) {}
        }
        let a = new A_Class()
        let node = new Node<A_Class>('A', a )
        expect ( typeof node.data ).toEqual('object')
    })

    Deno.test('A Node default class.data object should be of javascript type string', () => { 
        let node = new Node('A')
        expect ( typeof node.data ).toEqual('string')
    })

    Deno.test('A Node class.data type should be set to the type name', () => { 
        class A_Class { 
            constructor ( public i: number = 1 ) {}
        }
        let a = new A_Class()
        let node = new Node<A_Class>('A', a )
        console.log("TYPE:" + node.type)
        console.log("CLASS:" + (node.data as Object).constructor.name)
        expect ( node.type ).toEqual('A_Class')

    })

    Deno.test('A Node default class.data type should name type string', () => { 
        let node = new Node('A')
        expect ( typeof node.type ).toEqual('string')
    })

    Deno.test('A Node object.data type should be set to the type object', () => { 
        let a =   { 
           i: 1
        }
        let node = new Node<object>('A', a )
        expect ( node.type ).toEqual('Object')
    })

    Deno.test('A Node object.data type should be set to the type object', () => { 
        let a =   { 
           i: 1
        }
        let node = new Node<object>('A', a )
        expect ( node.type ).toEqual('Object')
    })

// })

// describe('Graph can handle nodes',  () => {
{
    let g = new CxGraph()

    Deno.test('It can add nodes objects and data', () => {    
        g.addNode( new Node('A') ) 
        expect(g.getNode('A').data).toBe('A')       
        g.addNode( new Node('B') )
        g.addNode( new Node('C', 'C-Node') )
        g.addNode( new Node('D', ['D-0', 'D-1']) )
        g.addNode( new Node('E', { type: 'Object'}) )
        g.addNode( new Node('F') )
        g.addNode( new Node('G') )
        g.addNode( new Node('H') )
        g.addNode( new Node('I') )
        g.addNode( new Node('J') )
        g.addNode( new Node('K') )
        g.addNode( new Node('L') )
        g.addNode( new Node('M') )
        g.addNode( new Node('N') )
        expect(g.hasNode('G')).toBe(true);
        expect(g.hasNode('N')).toBe(true);
        expect(g.hasNode('NotThere')).toBe(false);
        expect(g.size).toBe(14)
    })

    Deno.test('It can set Node data', () => {
        expect(typeof g.getNode('A').data ).toEqual('string')
        expect( g.getNode('A').data ).toEqual('A')
        class A_Class { 
            constructor ( public i: number = 1 ) {}
        }
        let a = new A_Class()
        g.setNodeData('A', a)
        expect(typeof g.getNode('A').data ).toEqual('object')
        expect(g.getNode('A').type ).toEqual('A_Class')
        expect( g.getNode('A').data.i ).toEqual(1)
        try {
            g.setNodeData('A', null)
        }
        catch (e) {
            expect(e.stack).toMatch(/null\/empty data object/m )
        }
        
    })

    Deno.test('It can add nodes based on strings', () => {    
        g.addNode('O') 
        expect(g.getNode('O').data).toBe('O')  
        g.addNode( 'P' ) 
        g.getNode('P').data = { myData: 'myData'} 
        expect( g.getNode('P').data.myData ).toBeDefined()
        expect( g.getNode('P').data.myData ).toBe('myData')
    })

    Deno.test('It can get nodes and data', () => {   
        expect(g.getNode('C').data).toEqual('C-Node')
        expect(g.getNode('D').data[1]).toEqual('D-1')
        expect(g.getNode('E').data.type).toEqual('Object')
        try {
            let  n = g.getNode('NotThere')
        }
        catch (e) {
            expect(e.stack).toMatch(/not found!/m )
        }
    })

    Deno.test('It can delete nodes', () => {   
        expect(g.getNode('C').data).toEqual('C-Node')
        g.removeNode('D')
        expect(g.hasNode('D')).toBe(false)
        expect(g.size).toBe(15)
    })
}
// })

// describe('Graph can handle dependencies',  () => {
{
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
    g.addNode( new Node('K') )
    g.addNode( new Node('L') )
    g.addNode( new Node('M') )
    g.addNode( new Node('N') )
   
    Deno.test('It can add dependencies', () => {    
        g.addDependency('A', 'B')
        g.addDependency('A', 'C')
        g.addDependency('B', 'D')
        g.addDependency('B', 'E')
        g.addDependency('C', 'F')
        g.addDependency('C', 'G')
        g.addDependency('G', 'H')
        g.addDependency('E', 'I')
        expect(g.dependenciesOf('B').includes('D')).toBe(true)
        expect(g.dependenciesOf('B').includes('E')).toBe(true)
        expect(g.dependantsOf('D').includes('B')).toBe(true)
        expect(g.dependantsOf('E').includes('B')).toBe(true)
       
    })

    Deno.test( 'Filter function can filter string Arrays', () => {
        expect( g.filter('XX', ['YY', 'XX', 'ZZ'] ).length ).toBe(2)
        expect( g.filter('XX', ['YY', 'XX', 'ZZ'] ).includes('XX') ).toBe(false)
        expect( g.filter('XY', ['YY', 'XX', 'ZZ'] ).length ).toBe(3)
    })

    Deno.test( 'removeNode should also remove dependencies', () => {
        g.removeNode('B')
        expect(g.hasNode('B')).toBe(false)
        let depOut = g.outgoingEdges

        expect( g.outgoingEdges.has('B') ).toBe(false)
        expect(g.incomingEdges.get('E')!.includes('B')).toBe(false)
    })
}
//})

// describe('Graph can preserve node order', () => {
{
    Deno.test('should retrieve dependencies and dependants in the correct order', () => {
        var g = new CxGraph()

        g.addNode('za')
        g.addNode('b')
        g.addNode('c')
        g.addNode('d')

        g.addDependency('za', 'd')
        g.addDependency('za', 'b')
        g.addDependency('b', 'c')
        g.addDependency('d', 'b')

        expect(g.dependenciesOf('za')).toEqual(['c', 'b', 'd'])
        expect(g.dependenciesOf('b')).toEqual(['c'])
        expect(g.dependenciesOf('c')).toEqual([])
        expect(g.dependenciesOf('d')).toEqual(['c', 'b'])

        expect(g.dependantsOf('za')).toEqual([])
        expect(g.dependantsOf('b')).toEqual(['za','d'])
        expect(g.dependantsOf('c')).toEqual(['za','d','b'])
        expect(g.dependantsOf('d')).toEqual(['za'])
    })

    Deno.test('It should be able to resolve the overall order of things', () => {
        var g = new CxGraph()

        g.addNode('a')
        g.addNode('zb')
        g.addNode('c')
        g.addNode('d')
        g.addNode('e')

        g.addDependency('a', 'zb')
        g.addDependency('a', 'c')
        g.addDependency('zb', 'c')
        g.addDependency('c', 'd')

        expect(g.overallOrder()).toEqual(['d', 'c', 'zb', 'a', 'e'])
    })

    Deno.test('It should be able to only retrieve the "leaves" in the overall order', () => {
        var g = new CxGraph();
    
        g.addNode('a');
        g.addNode('zb');
        g.addNode('c');
        g.addNode('d');
        g.addNode('e');
    
        g.addDependency('a', 'zb');
        g.addDependency('a', 'c');
        g.addDependency('zb', 'c');
        g.addDependency('c', 'd');
    
        expect(g.overallOrder(true)).toEqual(['d', 'e']);
      });
    
      Deno.test('It should be able to give the overall order for a graph with several disconnected subgraphs', () => {
        var g = new CxGraph();
    
        g.addNode('a_1');
        g.addNode('a_2');
        g.addNode('b_1');
        g.addNode('b_2');
        g.addNode('b_3');
    
        g.addDependency('a_1', 'a_2');
        g.addDependency('b_1', 'b_2');
        g.addDependency('b_2', 'b_3');
    
        expect(g.overallOrder()).toEqual(['a_2', 'a_1', 'b_3', 'b_2', 'b_1']);
      });
    
      Deno.test('It should give an empty overall order for an empty graph', () => {
        var g = new CxGraph();
    
        expect(g.overallOrder()).toEqual([]);
      });
    
      Deno.test('It should still work after nodes are removed', () => {
        var g = new CxGraph();
    
        g.addNode('a');
        g.addNode('b');
        g.addNode('c');
        g.addDependency('a', 'b');
        g.addDependency('b', 'c');
    
        expect(g.dependenciesOf('a')).toEqual(['c', 'b']);
    
        g.removeNode('c');
    
        expect(g.dependenciesOf('a')).toEqual(['b']);
      })
}
// })

// describe('HierarKey Graph can preserve node order', () => {
{
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
    g.addNode( new Node('K') )
    g.addNode( new Node('L') )
    g.addNode( new Node('M') )
    g.addNode( new Node('N') )
    g.addNode( new Node('O') )
    g.addNode( new Node('P') )
    g.addNode( new Node('Q') )
    g.addNode( new Node('R') )
    g.addNode( new Node('S') )
      
    g.addDependency('A', 'B')
    g.addDependency('A', 'C')
    g.addDependency('B', 'D')
    g.addDependency('B', 'E')
    g.addDependency('C', 'F')
    g.addDependency('C', 'G')
    g.addDependency('G', 'H')
    g.addDependency('E', 'I')

    Deno.test('It should present the Hierarchy of a node in the graph', () => {  
        let hierarKeyRep = g.hierarchyOf('A')
        // console.log(hierarKeyRep)
        let valArr = [ ...hierarKeyRep.values() ]
        expect(valArr).toEqual( ['01','01.01','01.01.01','01.01.02','01.01.02.01','01.02','01.02.01','01.02.02', '01.02.02.01'])
    })

    Deno.test('It should present the Hierarchy  of a node in the graph with larger stepSize', () => {  
        let hierarKeyRep = g.hierarchyOf('A', false, 4)
        // console.log(hierarKeyRep)
        let valArr = [ ...hierarKeyRep.values() ]
        expect(valArr).toEqual( ['0001','0001.0001','0001.0001.0001','0001.0001.0002','0001.0001.0002.0001','0001.0002','0001.0002.0001','0001.0002.0002', '0001.0002.0002.0001'])
    })

    Deno.test('It should present the Reversed Hierarchy of a node in the graph', () => {  
        let hierarKeyRep = g.hierarchyOf('A',true )
        // console.log(hierarKeyRep)
        let valArr = [ ...hierarKeyRep.values() ]
        expect(valArr).toEqual( ['01','01.01','01.01.01','01.01.02','01.01.02.01','01.02','01.02.01','01.02.02', '01.02.02.01'].reverse() )
    })

    Deno.test('It should present the Reversed overall Hierarchy the whole graph', () => {  
        g.addDependency('J', 'K')
        g.addDependency('J', 'L')
        g.addDependency('M', 'N')
        g.addDependency('N', 'O')
        g.addDependency('P', 'Q')
        g.addDependency('P', 'R')
        g.addDependency('Q', 'S')
        let hierarKeyRep = g.overallHierarchy( false, 3 )
        // console.log(hierarKeyRep)
        let valArr = [ ...hierarKeyRep.values() ]
        expect(valArr).toEqual(
       [ '001','001.001','001.001.001','001.001.002','001.001.002.001','001.002', '001.002.001',
         '001.002.002','001.002.002.001','002','002.001','002.002','003','003.001','003.001.001','004','004.001','004.001.001','004.002'] )
    })
    Deno.test('It should present the Reversed overall Hierarchy the whole graph in Reverse', () => { 
         let hierarKeyRep = g.overallHierarchy( true, 3 )
        // console.log(hierarKeyRep)
        let valArr = [ ...hierarKeyRep.values() ]
        expect(valArr).toEqual(
       [ '001','001.001','001.001.001','001.001.002','001.001.002.001','001.002', '001.002.001',
         '001.002.002','001.002.002.001','002','002.001','002.002','003','003.001','003.001.001','004','004.001','004.001.001','004.002'].reverse() )
    })
}
// })

// describe('Dependant Graph', () => {
{
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

    Deno.test('It should present find the correct dependants', () => {  
        let valArr: string[] = g.dependantsOf('I')
        expect(valArr).toEqual( ['A','C','G', 'H', 'B', 'E'])
    })

    Deno.test('It should present each dependant leaf node hierarchy top down', () => {  
        let hierarKeyRep: Map<string,string>[] = g.hierarchyOfDependants('I')
        let valArr = [ ...hierarKeyRep[0].values() ]
        expect(valArr).toEqual( ['01','01.01','01.01.01','01.01.02','01.01.02.01','01.01.02.01.01'])
        valArr = [ ...hierarKeyRep[1].values() ]
        expect(valArr).toEqual( ['01','01.01','01.02','01.02.01'])
    })

    Deno.test('It should present each reversed dependant leaf node hierarchy top down', () => {  
        let hierarKeyRep: Map<string,string>[] = g.hierarchyOfDependants('I', true)
        let valArr = [ ...hierarKeyRep[0].values() ]
        expect(valArr).toEqual( ['01','01.01','01.01.01','01.01.02','01.01.02.01','01.01.02.01.01'].reverse())
        valArr = [ ...hierarKeyRep[1].values() ]
        expect(valArr).toEqual( ['01','01.01','01.02','01.02.01'].reverse())
    })
}
// })

