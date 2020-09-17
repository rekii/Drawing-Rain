/**
 * Yellowtail
 * by Golan Levin (www.flong.com).
 *
 * Click, drag, and release to create a kinetic gesture.
 *
 * Yellowtail (1998-2000) is an interactive software system for the gestural
 * creation and performance of real-time abstract animation. Yellowtail repeats
 * a user's strokes end-over-end, enabling simultaneous specification of a
 * line's shape and quality of movement. Each line repeats according to its
 * own period, producing an ever-changing and responsive display of lively,
 * worm-like textures.
 *
 * This p5.js version was originally created by Naoto Hieda (naotohieda.com) 2019
 * And modified by Chao Feng (chaofeng.design) 2020
 */

function Polygon () {
  this.xpoints = new Array(4);
  this.ypoints = new Array(4);
}

function SYellowtail (p, w, h) {
	this.p = p;

	this.gestureArray;
	this.nGestures = 36;  // Number of gestures
	this.minMove = 3;     // Minimum travel for a new point
	this.currentGestureID;

	this.tempP;
	this.tmpXp;
	this.tmpYp;

  this.ifUpdate = true; // Boolean value to toggle movements

  p.background(0, 0, 0);
  p.noStroke();

  this.currentGestureID = -1;
  this.gestureArray = new Array(this.nGestures);
  for (let i = 0; i < this.nGestures; i++) {
    this.gestureArray[i] = new Gesture(p.width, p.height);
  }
  this.clearGestures();
}

SYellowtail.prototype.draw = function () {
	let p = this.p;
  p.background(255);

  // print("update");
  if (this.ifUpdate)
    this.updateGeometry();
  p.fill(0, 225);
  for (let i = 0; i < this.nGestures; i++) {
    this.renderGesture(this.gestureArray[i], p.width, p.height);
  }
}

SYellowtail.prototype.mousePressed = function () {
	let p = this.p;
  this.currentGestureID = (this.currentGestureID+1) % this.nGestures;
  let G = this.gestureArray[this.currentGestureID];
  G.clear();
  G.clearPolys();
  G.addPoint(p.mouseX, p.mouseY);
}

SYellowtail.prototype.mouseDragged = function () {
	let p = this.p;
  if (this.currentGestureID >= 0) {
    let G = this.gestureArray[this.currentGestureID];
    if (G.distToLast(p.mouseX, p.mouseY) > this.minMove) {
      G.addPoint(p.mouseX, p.mouseY);
      G.smooth();
      G.compile();
    }
  }
}

SYellowtail.prototype.keyPressed = function () {
	let p = this.p;
  if (p.key == '+' || p.key == '=') {
    if (this.currentGestureID >= 0) {
      let th = this.gestureArray[this.currentGestureID].thickness;
      this.gestureArray[this.currentGestureID].thickness = Math.min(96, th+1);
      this.gestureArray[this.currentGestureID].compile();
    }
  } else if (p.key == '-') {
    if (this.currentGestureID >= 0) {
      let th = this.gestureArray[this.currentGestureID].thickness;
      this.gestureArray[this.currentGestureID].thickness = Math.max(2, th-1);
      this.gestureArray[this.currentGestureID].compile();
    }
  } else if (p.key == ' ') {
    this.clearGestures();
  } else if (p.key == 'p') {
    this.ifUpdate = !this.ifUpdate;
    // print("touched");
  }
}

SYellowtail.prototype.renderGesture = function (gesture, w, h) {
	let p = this.p;
  if (gesture.exists) {
    if (gesture.nPolys > 0) {
      let polygons = gesture.polygons;
      let crosses = gesture.crosses;

      let xpts;
      let ypts;
      let poly;
      let cr;

      p.beginShape(p.QUADS);
      let gnp = gesture.nPolys;
      for (let i=0; i<gnp; i++) {

        poly = polygons[i];
        xpts = poly.xpoints;
        ypts = poly.ypoints;


        p.vertex(xpts[0], ypts[0]);
        p.vertex(xpts[1], ypts[1]);
        p.vertex(xpts[2], ypts[2]);
        p.vertex(xpts[3], ypts[3]);

        if ((cr = crosses[i]) > 0) {
          if ((cr & 3)>0) {
            p.vertex(xpts[0]+w, ypts[0]);
            p.vertex(xpts[1]+w, ypts[1]);
            p.vertex(xpts[2]+w, ypts[2]);
            p.vertex(xpts[3]+w, ypts[3]);

            p.vertex(xpts[0]-w, ypts[0]);
            p.vertex(xpts[1]-w, ypts[1]);
            p.vertex(xpts[2]-w, ypts[2]);
            p.vertex(xpts[3]-w, ypts[3]);
          }
          if ((cr & 12)>0) {
            p.vertex(xpts[0], ypts[0]+h);
            p.vertex(xpts[1], ypts[1]+h);
            p.vertex(xpts[2], ypts[2]+h);
            p.vertex(xpts[3], ypts[3]+h);

            p.vertex(xpts[0], ypts[0]-h);
            p.vertex(xpts[1], ypts[1]-h);
            p.vertex(xpts[2], ypts[2]-h);
            p.vertex(xpts[3], ypts[3]-h);
          }

          // I have knowingly retained the small flaw of not
          // completely dealing with the corner conditions
          // (the case in which both of the above are true).
        }
      }
      p.endShape();
    }
  }
}

SYellowtail.prototype.updateGeometry = function () {
	let p = this.p;
  let J;
  for (let g=0; g<this.nGestures; g++) {
    if ((J=this.gestureArray[g]).exists) {
      if (g!=this.currentGestureID) {
        this.advanceGesture(J);
      } else if (!p.mouseIsPressed) {
        this.advanceGesture(J);
      }
    }
  }
}

SYellowtail.prototype.advanceGesture = function (gesture) {
  // Move a Gesture one step
  if (gesture.exists) { // check
    let nPts = gesture.nPoints;
    let nPts1 = nPts-1;
    let path;
    let jx = gesture.jumpDx;
    let jy = gesture.jumpDy;

    if (nPts > 0) {
      path = gesture.path;
      for (let i = nPts1; i > 0; i--) {
        path[i].x = path[i-1].x;
        path[i].y = path[i-1].y;
      }
      path[0].x = path[nPts1].x - jx;
      path[0].y = path[nPts1].y - jy;
      gesture.compile();
    }
  }
}

SYellowtail.prototype.clearGestures = function () {
  for (let i = 0; i < this.nGestures; i++) {
    this.gestureArray[i].clear();
  }
}


var s = function (p) {
  let sYellowtail;


  p.setup = function () {
    p.createCanvas(p.displayWidth, p.displayWidth);
    p.frameRate(60);
	  sYellowtail = new SYellowtail(p, p.displayWidth, p.displayHeight);
  }

  p.draw = function () {
    // p.background(0);
    sYellowtail.draw();
    //p.image(sYellowtail.pg, 0, 0);
  }

  p.mousePressed = function () {
		sYellowtail.mousePressed();
  }

  p.mouseDragged = function () {
		sYellowtail.mouseDragged();
  }

  p.keyPressed = function () {
    sYellowtail.keyPressed();
  }
};

var p5js = new p5(s);
