	    function Vector(x, y) {
	        this.x = x;
	        this.y = y;
	    };
		
	    Vector.prototype = {
	        rotate: function (theta) {
	            var x = this.x;
	            var y = this.y;
	            this.x = Math.cos(theta) * x - Math.sin(theta) * y;
	            this.y = Math.sin(theta) * x + Math.cos(theta) * y;
	            return this;
	        },
	        mult: function (f) {
	            this.x *= f;
	            this.y *= f;
	            return this;
	        },
	        clone: function () {
	            return new Vector(this.x, this.y);
	        },
	        length: function () {
	            return Math.sqrt(this.x * this.x + this.y * this.y);
	        },
	        subtract: function (v) {
	            this.x -= v.x;
	            this.y -= v.y;
	            return this;
	        },
	        set: function (x, y) {
	            this.x = x;
	            this.y = y;
	            return this;
	        }
	    };
		
	    function Petal(stretchA, stretchB, startAngle, angle, growFactor, bloom) {
	        this.stretchA = stretchA;
	        this.stretchB = stretchB;
	        this.startAngle = startAngle;
	        this.angle = angle;
	        this.bloom = bloom;
	        this.growFactor = growFactor;
	        this.r = 1;
	        this.isfinished = false;
	        //this.tanAngleA = Garden.random(-Garden.degrad(Garden.options.tanAngle), Garden.degrad(Garden.options.tanAngle));
	        //this.tanAngleB = Garden.random(-Garden.degrad(Garden.options.tanAngle), Garden.degrad(Garden.options.tanAngle));
	    }
	    Petal.prototype = {
	        draw: function () {
	            var ctx = this.bloom.garden.ctx;
	            var v1, v2, v3, v4;
	            v1 = new Vector(0, this.r).rotate(Garden.degrad(this.startAngle));
	            v2 = v1.clone().rotate(Garden.degrad(this.angle));
	            v3 = v1.clone().mult(this.stretchA); //.rotate(this.tanAngleA);
	            v4 = v2.clone().mult(this.stretchB); //.rotate(this.tanAngleB);
	            ctx.strokeStyle = this.bloom.c;
	            ctx.beginPath();
	            ctx.moveTo(v1.x, v1.y);
	            ctx.bezierCurveTo(v3.x, v3.y, v4.x, v4.y, v2.x, v2.y);
	            ctx.stroke();
	        },
	        render: function () {
	            if (this.r <= this.bloom.r) {
	                this.r += this.growFactor; // / 10;
	                this.draw();
	            } else {
	                this.isfinished = true;
	            }
	        }
	    }

	    function Bloom(p, r, c, pc, garden, type) {
	        this.p = p;
	        this.r = r;
	        this.c = c;
	        this.pc = pc;
	        this.garden = garden;
	        this.type = type || 'daisy';
	        this.petals = [];
	        this.init();
	        this.garden.addBloom(this);
	    }
	    Bloom.prototype = {
	        draw: function () {
	            var p, isfinished = true;
	            this.garden.ctx.save();
	            this.garden.ctx.translate(this.p.x, this.p.y);
	            for (var i = 0; i < this.petals.length; i++) {
	                p = this.petals[i];
	                p.render();
	                isfinished *= p.isfinished;
	            }
	            
	            // Determine current progress to grow the center elements dynamically
	            var currentR = 0;
	            if (this.petals.length > 0) {
	                for (var i = 0; i < this.petals.length; i++) {
	                    currentR += this.petals[i].r;
	                }
	                currentR /= this.petals.length;
	            }
	            
	            if (this.type === 'daisy') {
	                this.drawDaisyCenter(currentR);
	            } else if (this.type === 'lily') {
	                this.drawLilyCenter(currentR);
	            }
	            
	            this.garden.ctx.restore();
	            if (isfinished == true) {
	                this.garden.removeBloom(this);
	            }
	        },
	        drawDaisyCenter: function (currentR) {
	            var ctx = this.garden.ctx;
	            var centerR = currentR * 0.20; // Reduced ratio so white petals are more prominent
	            if (centerR < 0.6) return;
	            
	            ctx.save();
	            ctx.globalCompositeOperation = 'source-over';
	            
	            // Soft shadow under the center disc for depth (only for larger centers)
	            if (centerR >= 3.5) {
	                ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
	                ctx.shadowBlur = 2;
	            }
	            
	            // Draw a vibrant solid golden yellow center
	            ctx.beginPath();
	            ctx.arc(0, 0, centerR, 0, Math.PI * 2);
	            ctx.fillStyle = '#ffcc00';
	            ctx.fill();
	            
	            // Reset shadow
	            ctx.shadowBlur = 0;
	            
	            // Inner orange core/depth (only if center is large enough)
	            if (centerR >= 2.5) {
	                ctx.beginPath();
	                ctx.arc(0, 0, centerR * 0.55, 0, Math.PI * 2);
	                ctx.fillStyle = '#ff9900';
	                ctx.fill();
	            }
	            
	            // Small texture dots for the daisy disc florets (only if center is large enough)
	            if (centerR >= 4.5) {
	                ctx.fillStyle = '#b75300';
	                for (var i = 0; i < 6; i++) {
	                    var angle = (i * Math.PI) / 3;
	                    var dist = centerR * 0.4;
	                    ctx.beginPath();
	                    ctx.arc(Math.cos(angle) * dist, Math.sin(angle) * dist, centerR * 0.08, 0, Math.PI * 2);
	                    ctx.fill();
	                }
	            }
	            
	            ctx.restore();
	        },
	        drawLilyCenter: function (currentR) {
	            var ctx = this.garden.ctx;
	            var stamenLen = currentR * 0.48;
	            if (stamenLen < 1.5) return;
	            
	            ctx.save();
	            ctx.globalCompositeOperation = 'source-over';
	            
	            var numStamens = 5; // Reduced to 5 for less clutter on small lilies
	            var startAngle = this.petals[0] ? this.petals[0].startAngle : 0;
	            var angleStep = 360 / numStamens;
	            
	            for (var i = 0; i < numStamens; i++) {
	                var angle = Garden.degrad(startAngle + i * angleStep + 36);
	                var cos = Math.cos(angle);
	                var sin = Math.sin(angle);
	                
	                // Stamen filament (thin line from center)
	                ctx.beginPath();
	                ctx.moveTo(0, 0);
	                ctx.lineTo(cos * stamenLen, sin * stamenLen);
	                ctx.lineWidth = 0.8; // Thinner lines for small flowers
	                ctx.strokeStyle = '#d4e157';
	                ctx.stroke();
	                
	                // Anther (T-shaped pollen sac, only drawn if flower is large enough to avoid clutter)
	                if (currentR >= 4.5) {
	                    var antherX = cos * stamenLen;
	                    var antherY = sin * stamenLen;
	                    ctx.save();
	                    ctx.translate(antherX, antherY);
	                    ctx.rotate(angle + Math.PI / 2);
	                    
	                    ctx.beginPath();
	                    if (ctx.ellipse && currentR >= 7) {
	                        ctx.ellipse(0, 0, currentR * 0.09, currentR * 0.04, 0, 0, Math.PI * 2);
	                    } else {
	                        ctx.arc(0, 0, currentR * 0.06, 0, Math.PI * 2);
	                    }
	                    ctx.fillStyle = '#8d6e63';
	                    ctx.fill();
	                    ctx.restore();
	                }
	            }
	            
	            // Also draw a tiny pistil in the absolute center
	            ctx.beginPath();
	            ctx.arc(0, 0, currentR * 0.1, 0, Math.PI * 2);
	            ctx.fillStyle = '#81c784';
	            ctx.fill();
	            
	            ctx.restore();
	        },
	        init: function () {
	            var angle = 360 / this.pc;
	            var startAngle = Garden.randomInt(0, 90);
	            // Increased Daisy stretch parameters (0.7 to 2.0) to make white petals longer and more prominent
	            var stretchMin = this.type === 'lily' ? 1.2 : 0.7;
	            var stretchMax = this.type === 'lily' ? 2.5 : 2.0;
	            for (var i = 0; i < this.pc; i++) {
	                this.petals.push(new Petal(
	                    Garden.random(stretchMin, stretchMax), 
	                    Garden.random(stretchMin, stretchMax), 
	                    startAngle + i * angle, 
	                    angle, 
	                    Garden.random(Garden.options.growFactor.min, Garden.options.growFactor.max), 
	                    this
	                ));
	            }
	        }
	    }

	    function Garden(ctx, element) {
	        this.blooms = [];
	        this.element = element;
	        this.ctx = ctx;
	    }
	    Garden.prototype = {
	        render: function () {
	            for (var i = 0; i < this.blooms.length; i++) {
	                this.blooms[i].draw();
	            }
	        },
	        addBloom: function (b) {
	            this.blooms.push(b);
	        },
	        removeBloom: function (b) {
	            var bloom;
	            for (var i = 0; i < this.blooms.length; i++) {
	                bloom = this.blooms[i];
	                if (bloom === b) {
	                    this.blooms.splice(i, 1);
	                    return this;
	                }
	            }
	        },
	        createRandomBloom: function (x, y) {
	            var type = Math.random() < 0.5 ? 'daisy' : 'lily';
	            var r = Garden.randomInt(Garden.options.bloomRadius.min, Garden.options.bloomRadius.max);
	            var c, pc;
	            if (type === 'daisy') {
	                // Daisies are soft warm white
	                var whiteVal = Math.round(Garden.random(245, 255));
	                var yellowVal = Math.round(Garden.random(245, 255));
	                var blueVal = Math.round(Garden.random(225, 240));
	                c = 'rgba(' + whiteVal + ',' + yellowVal + ',' + blueVal + ',' + Garden.options.color.opacity * 2.2 + ')';
	                pc = Garden.randomInt(12, 16);
	            } else {
	                // Lilies are pink, magenta, or red-orange
	                var redVal = Math.round(Garden.random(235, 255));
	                var greenVal = Math.round(Garden.random(60, 110));
	                var blueVal = Math.round(Garden.random(110, 160));
	                c = 'rgba(' + redVal + ',' + greenVal + ',' + blueVal + ',' + Garden.options.color.opacity * 1.8 + ')';
	                pc = 6;
	            }
	            this.createBloom(x, y, r, c, pc, type);
	        },
	        createBloom: function (x, y, r, c, pc, type) {
	            new Bloom(new Vector(x, y), r, c, pc, this, type);
	        },
	        clear: function () {
	            this.blooms = [];
	            this.ctx.clearRect(0, 0, this.element.width, this.element.height);
	        }
	    }

	    Garden.options = {
	        petalCount: {
	            min: 8,
	            max: 15
	        },
	        petalStretch: {
	            min: 0.1,
	            max: 3
	        },
	        growFactor: {
	            min: 0.1,
	            max: 1
	        },
	        bloomRadius: {
	            min: 8,
	            max: 10
	        },
	        density: 10,
	        growSpeed: 1000 / 60,
	        color: {
				rmin: 128,
				rmax: 255,
				gmin: 0,
				gmax: 128,
				bmin: 0,
				bmax: 128,
	            opacity: 0.1
	        },
	        tanAngle: 60
	    };
	    Garden.random = function (min, max) {
	        return Math.random() * (max - min) + min;
	    };
	    Garden.randomInt = function (min, max) {
	        return Math.floor(Math.random() * (max - min + 1)) + min;
	    };
	    Garden.circle = 2 * Math.PI;
	    Garden.degrad = function (angle) {
	        return Garden.circle / 360 * angle;
	    };
	    Garden.raddeg = function (angle) {
	        return angle / Garden.circle * 360;
	    };
	    Garden.rgba = function (r, g, b, a) {
	        return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
	    };
	    Garden.randomrgba = function (rmin, rmax, gmin, gmax, bmin, bmax, a) {
			var r = Math.round(Garden.random(rmin, rmax));
			var g = Math.round(Garden.random(gmin, gmax));
			var b = Math.round(Garden.random(bmin, bmax));
			var limit = 5;
			if (Math.abs(r - g) <= limit && Math.abs(g - b) <= limit && Math.abs(b - r) <= limit) {
				return Garden.rgba(rmin, rmax, gmin, gmax, bmin, bmax, a);
			} else {
				return Garden.rgba(r, g, b, a);
			}
	    };
