import React, { Component } from 'react';
import './World.css';

'use strict';
// console.clear();


const borderWidth = 5;//px
const turnTimeout = 100;
const noOfCritters = 10;

const onStartPlay = false;

const cellSize = 10;//px
const deadCellColor = 'white';
const bornCellColor = 'lightgrey'
const aliveCellColor = 'black';


class Vector {
  constructor (x, y){
    this.x = x;
    this.y = y;
  }
  
  plus(other){
    return new Vector (this.x + other.x, this.y + other.y)
  }  
}

const directionNames = 'n ne e se s sw w nw'.split(' '); 

const directions = {
  'n' : new Vector(0,1),
  'ne': new Vector(1,1),
  'e' : new Vector(1,0),
  'se': new Vector(1,-1),
  's' : new Vector(0,-1),
  'sw': new Vector(-1,-1),
  'w' : new Vector(-1,0),
  'nw': new Vector(-1,1),
}

function randomElement(array){
  return array[Math.floor(Math.random() * array.length)];
}

class BouncingCritter {
  constructor(){
    this.direction = randomElement(directionNames);
  }

  act(view){
    if (view.look(this.direction) != 0) {
      this.direction = view.find(0) || 's';
    }
    return {type: 'move', direction: this.direction}
  };
}

class View {
  constructor(world, vector){
    this.world = world;
    this.vector = vector;
  }

  look(dir){
    let target = this.vector.plus(directions[dir]);
    if (this.world.isInside(target)) {
      return this.world.get(target);
    }
  }

  findAll(cellType){
    let found = [];
    
    for (let dir in directions) {
      if (this.look(dir) === cellType) {
        found.push(dir);
      }
    }
    return found;
  }

  find(cellType){
    let found = this.findAll(cellType);
    if (found.length === 0){
      return null;
    }
    return randomElement(found);
  }

}


function Cell(props){
  let cellColor;
  if (Number(props.state) === 0) cellColor = deadCellColor;
  else if (Number(props.state) === 1) cellColor = bornCellColor;
  else if (Number(props.state) === 2) cellColor = aliveCellColor;

  let cellStyle = {
    float: 'left',
    width: cellSize + 'px',
    height: cellSize + 'px',
    backgroundColor: cellColor,
    //border: '1px solid black',
  }
  return (
          <div onClick={()=>props.onClick(props.vector)} style={cellStyle}></div>)
}

class World extends React.Component {
  constructor (props){
    super(props);
    
    let width = Number(this.props.width);
    let height = Number(this.props.height);
    let population = 0;
    let grid = [];
    for (let y = 0; y < height; y++){
      grid.push([]);
      for (let x = 0; x < width; x++) {
        grid[y].push(0);
      }
    }


    let i = 0;
    while (i < noOfCritters){
      let randomX = Math.floor(Math.random() * width);
      let randomY = Math.floor(Math.random() * height);
      if (grid[randomY][randomX] === 0){
        grid[randomY][randomX] = (new BouncingCritter());
        i++;
      }
    }

    console.log(grid);
    this.state = {
      grid: grid,
      generations: 0,
      population: population,
    }
    
    this.isPlaying = onStartPlay;
    this.turn = this.turn.bind(this);
    this.start = this.start.bind(this);
    this.play = this.play.bind(this);
    this.step = this.step.bind(this);
    this.clearGrid = this.clearGrid.bind(this);
    this.handleCellClick = this.handleCellClick.bind(this);
  }
  
  get(vector){
    return this.state.grid[vector.y][vector.x]; //row y, column x
  }
  
  set(vector, value){
    this.setState(state => {
      state.grid[vector.y][vector.x] = value;
      return {grid: state.grid};
    });
  }
  

  isInside(vector) {
    const width = this.props.width;
    const height = this.props.height;
    
    return (vector.x >= 0) && (vector.x < width) &&
           (vector.y >= 0) && (vector.y < height); 
  }
  
  
  
  turn(){
    //let start = Date.now();
    let acted = [];
    let grid = this.state.grid.slice();
    this.state.grid.forEach((row, y) => {
      row.forEach((critter, x) =>{
        let vector = new Vector(x,y);
        
        if (critter !== null) {
          if (critter.act && acted.indexOf(critter) === -1){
            acted.push(critter);
            grid = this.letAct(grid,critter, vector);
          }
        }
      });
    });
    //console.log(grid === this.state.grid);
    this.setState({grid: grid});
    //console.log('turn took', Date.now() - start, 'ms');
  }

  letAct(grid, critter, vector) {
    let action = critter.act(new View(this, vector));
    if (action && action.type === 'move'){
      let dest = this.checkDestination(action, vector);
      if (dest && this.get(dest) === 0) {
        grid[vector.y][vector.x] = 0;
        grid[dest.y][dest.x] = critter;
      }
    }
    return grid;
  }

  checkDestination(action, vector){
    if (directions.hasOwnProperty(action.direction)) {
      let dest = vector.plus(directions[action.direction]);
      if (this.isInside(dest)) 
        return dest;
    }
  }
  
  clearGrid(){
    const width = this.props.width;
    const height = this.props.height;
    //debugger;
    // stop 
    this.isPlaying = false;
    this.setState({generations: 0,
                   population: 0});
    // clear
    for (let y = 0; y <= height - 1; y++){
      for (let x = 0; x <= width - 1; x++){
        this.set(new Vector(x,y), 0);
      }
    }
  }
  
  play(){
    if (this.isPlaying){
      this.turn();
      setTimeout(this.play, turnTimeout);
    }
  }
  
  step(){
    this.isPlaying = false;
    this.turn();
  }
  
  start(){
    //console.log(this.isPlaying);
    this.isPlaying = !this.isPlaying;
    if (this.isPlaying) this.play();
  }
  
  handleCellClick(vector){
    if (this.get(vector) > 0){
      this.set(vector,0);
    } else {
      this.set(vector,1);
      this.setState(state => {population: state.population++});
    }
  }
  
  componentDidMount(){
    this.play();
  }
  
  
  render(){
    //console.log(this.state.grid);
    //let start = Date.now();
    let playButton = this.isPlaying ? '||' : (<span>&#8883</span>);
    const rowStyle = {
      height: cellSize + 'px',
      width: this.props.width * cellSize + borderWidth * 2 + 'px',
    }
    
    const worldStyle = {
      width: this.props.width * cellSize + borderWidth * 2 + 'px',
      height: this.props.height * cellSize + borderWidth * 2 + 'px',
      border: borderWidth + 'px solid black',
      margin: '10px auto',
    }
    
    let world = this.state.grid.map((row, y) => (
                  <div key={y} style={rowStyle}>
                    {row.map((cell, x) => {
                       return (<Cell state={cell}
                                key={x + y * this.props.height} 
                                vector={new Vector(x,y)}
                                onClick={this.handleCellClick}/>
                              )
                      }
                    )}
                  </div>)
      
    )
    
    //console.log('render took', Date.now() - start, 'ms');
    return (
      <div className='container'>
        <p>Generations: {this.state.generations}, population now: {this.state.population}</p>
        <div style={worldStyle}>
          {world}
        </div>
        <div className='buttons'>
          <button onClick={this.step}>Step</button>
          <button onClick={this.start}>{playButton}</button>
          <button onClick={this.clearGrid}>Clear!</button>
        </div>
      </div>

    )
  }
}

export default World;
