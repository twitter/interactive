// Library for placing labels using the force
// Author: Krist Wongsuphasawat

var jedi = {};

jedi.debugging = true;

jedi.node = function(idealPos, currentPos, width, data){
  this.idealPos = idealPos;
  this.currentPos = currentPos;
  this.width = width;
  this.data = data;
};

// return negative if overlap
jedi.node.prototype.calculateDistance = function(node){
  var halfWidth = this.width/2;
  var thisMin = this.currentPos - halfWidth;
  var thisMax = this.currentPos + halfWidth;

  var nodeHalfWidth = node.width/2;
  var nodeMin = node.currentPos - nodeHalfWidth;
  var nodeMax = node.currentPos + nodeHalfWidth;

  var posArray = [{node:"a", pos:thisMin}, {node:"a", pos:thisMax}, {node:"b", pos:nodeMin}, {node:"b", pos:nodeMax}];
  posArray.sort(function(a,b){return a.pos-b.pos;});

  var diff = posArray[2].pos - posArray[1].pos;
  if(posArray[2].node == posArray[0].node || posArray[2].node == posArray[1].node){
    return diff * -1;
  }
  else{
    return diff;
  }
};

jedi.node.prototype.overlapWith = function(node){
  return this.calculateDistance(node) < 0;
};

jedi.node.prototype.calculatePositionBefore = function(node){
  return node.currentPos - node.width/2 - this.width/2;
};

jedi.node.prototype.calculatePositionAfter = function(node){
  return node.currentPos + node.width/2 + this.width/2;
};

jedi.force = function(){
  this.springK = 0.3;
  this.hardSpringK = 1;//8.988e9;
  this.coulombK = 100;
  this.damping = 0.01;
  this.epsilon = 1;
  this.timestep = 1;
  this.nodeSpacing = 3;
};

jedi.force.prototype.repulsion = function(node1, node2){
  var distance = node1.calculateDistance(node2)+0.1;

  // no repulsion is necessary if enough space already
  if(distance >= this.nodeSpacing*2){
    return 0;
  }
  else if(distance < 0){
    return 80;
  }

  return this.coulombK / (distance*distance);

  // if(distance > 0){
  //   distance = this.nodeSpacing - distance;
  //   return distance*distance*distance*distance;
  // }
  // else if(distance < 0){
  //   return 80;
  // }
  // // return this.coulombK * node1.width * node2.width / (distance * distance);
  // return distance * distance;
};

jedi.force.prototype.springForce = function(node, k){
  var displacement = node.idealPos - node.currentPos;
  return k * displacement;
};

// var input = {
//   bounds: [min,max]
//   block:[]
// }
jedi.force.prototype.simulate = function(nodes, round){
  var self = this;

  nodes.sort(function(a,b){ return a.idealPos - b.idealPos; })

  nodes.forEach(function(node, index){
    // setup initial velocities to 0
    node.velocity = 0;
    // spread out nodes by default
    if(index==0){
      node.currentPos = 0;
    }
    else{
      var prevNode = nodes[index-1];
      node.currentPos = node.calculatePositionAfter(prevNode) + self.nodeSpacing-1;
    }
  });

  // Try to move nodes to ideal position, start from the end
  //
  for(var i=nodes.length-1;i>=0;i--){
    if(nodes[i].currentPos < nodes[i].idealPos){
      if(i==nodes.length-1){
        nodes[i].currentPos = nodes[i].idealPos;
      }
      else{
        var nextNode = nodes[i+1];
        if(nodes[i].idealPos < nextNode.currentPos){
          var oldPos = nodes[i].currentPos;
          nodes[i].currentPos = nodes[i].idealPos;
          if(nodes[i].overlapWith(nextNode)){
            nodes[i].currentPos = nodes[i].calculatePositionBefore(nextNode)-self.nodeSpacing-1;//oldPos;
          }
        }
      }
    }
  }

  for(var i=0;i<round;i++){
    var totalKineticEnergy = 0;

    nodes.forEach(function(node, index){
      node.force = 0;

      var repulsion = 0;
      if(index>0){
         repulsion += self.repulsion(nodes[index-1], node) * 0.5;
      }
      if(index<nodes.length-1){
         repulsion += self.repulsion(node, nodes[index+1]) * -0.5;
      }
      node.force += repulsion;
      node.force += self.springForce(node, (repulsion==0)?self.hardSpringK:self.springK);
      node.velocity = (node.velocity + self.timestep * node.force) * self.damping;

      var nextPos = node.currentPos + self.timestep * node.velocity;
      if(self.minPos && index == 0 && nextPos < self.minPos){
        node.force += self.hardSpringK * (self.minPos-nextPos) *100
        node.velocity = (node.velocity + self.timestep * node.force) * self.damping;
        // node.currentPos = Math.min(self.maxPos, node.currentPos + self.timestep * node.velocity);
      }
      else if(self.maxPos && index == nodes.length-1 && nextPos > self.maxPos){
        node.force -= self.hardSpringK * (nextPos - self.maxPos) *100
        node.velocity = (node.velocity + self.timestep * node.force) * self.damping;
        // node.currentPos = Math.min(self.maxPos, node.currentPos + self.timestep * node.velocity);
      }

      // node.velocity = (node.velocity + self.timestep * node.force) * self.damping;
      node.currentPos = Math.max(0, node.currentPos + self.timestep * node.velocity);

      if(index>0){
        var prevNode = nodes[index-1];
        node.currentPos = Math.max(node.calculatePositionAfter(prevNode) + 1, node.currentPos);
      }
      if(index<nodes.length-1){
        var nextNode = nodes[index+1];
        node.currentPos = Math.min(node.calculatePositionBefore(nextNode) - 1, node.currentPos);
      }
      totalKineticEnergy += 10* node.velocity * node.velocity;
    });

    if(totalKineticEnergy <= self.epsilon){
      if(jedi.debugging){
        console.log("simulation stable: break");
      }
      break;
    }
  }

  // quickly move nodes to ideal position if possible
  for(var i=nodes.length-1;i>=0;i--){
    if(nodes[i].currentPos != nodes[i].idealPos){
      var oldPos = nodes[i].currentPos;
      var prevNode = i==0?null:nodes[i-1];
      var nextNode = i==nodes.length-1?null:nodes[i+1];
      if(nodes[i].idealPos > nodes[i].currentPos && (!nextNode || nodes[i].idealPos < nextNode.currentPos)){
        nodes[i].currentPos = nodes[i].idealPos;
        if(nextNode && nodes[i].overlapWith(nextNode)){
          nodes[i].currentPos = oldPos;
        }
      }
      if(nodes[i].idealPos < nodes[i].currentPos && (!prevNode || nodes[i].idealPos > prevNode.currentPos)){
        nodes[i].currentPos = nodes[i].idealPos;
        if(prevNode && nodes[i].overlapWith(prevNode)){
          nodes[i].currentPos = oldPos;
        }
      }
    }
  }
  return nodes;
}