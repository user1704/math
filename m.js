function gcd(a, b) {
    if(b==0){
        return a
    }
    return gcd(b,a%b)    
}
class Frac {
    constructor(n, d = 1) {
      if (d == 0) {
        throw new Error("denominator cannot be zero!");
      }
      let Gcd=gcd(n,d)
      this.n = n/Gcd;
      this.d = d/Gcd;
    }
    frac() {
      if(this.d<0){
        return -this.n +'/'+(-this.d)
     }
      if(this.d==1){
          return this.n
      }
      return this.n +'/'+this.d
    }
    float() {
      return this.n / this.d
    }
    add(other) {
        if (other instanceof Frac) {
          let Gcd = gcd(this.d, other.d)
          return new Frac(this.n * other.d + other.n * this.d,this.d * other.d )
        } else {
          return new Frac(this.n + other * this.d, this.d)
        }
      }
    sub(other) {
        if (other instanceof Frac) {
          let Gcd = gcd(this.d, other.d)
          return new Frac(this.n * other.d - other.n * this.d,this.d * other.d )
        } else {
          return new Frac(this.n - other * this.d, this.d)
        }
      }
    mult(other) {
        if (other instanceof Frac) {
          return new Frac(this.n * other.n, this.d * other.d)
        } else {
          return new Frac(this.n * other, this.d)
        }
      }
    div(other) {
        if (other instanceof Frac) {
          return new Frac(this.n * other.d, this.d * other.n)
        } else {
          return new Frac(this.n, this.d* other)
        }
      }
    pow(exp) {
        if (exp < 0) {
            return new Frac(this.d ** -exp, this.n ** -exp)
        } else {
            return new Frac(this.n ** exp, this.d ** exp)
        }
    }
  }
