import Expression from './Expression.js';
import ExpressionParser from './ExpressionParser.js';
import LazyPolynomialRoot from './PolynomialRoot.js';




var SimpleInterval = LazyPolynomialRoot.SimpleInterval;
//var PolynomialRoot = LazyPolynomialRoot.PolynomialRoot;


function PolynomialRootSymbol(polynomial, interval) {
  Expression.Symbol.call(this, "[root of " + polynomial + " near " + interval.a.add(interval.b).divide(Expression.TWO).toString() + "]");
  this.polynomial = polynomial;
  //TODO: https://www.wolframalpha.com/input/?i=x**5%2B7x**3%2Bx**2%2Bx%2B1%3D0
  this.interval = interval;
}
PolynomialRootSymbol.prototype = Object.create(Expression.Symbol.prototype);

PolynomialRootSymbol.prototype.toDecimal = function (precision) {
  var tmp = this.polynomial.getZero(this.interval, precision);
  return new SimpleInterval(tmp.a, tmp.b);
};

PolynomialRootSymbol.prototype.isExact = function () {
  //TODO: fix - ?
  return false;
};


PolynomialRootSymbol.prototype.toMathML = function (options) {
  options = options || {};
  if (options.fractionDigits != null) {
    throw new TypeError('options.fractionDigits is deprecated, please use options.rounding');
  }
  var rounding = options.rounding || {fractionDigits: 3};
  var tmp = toDecimalStringInternal(this, rounding, Expression._decimalToMathML, Expression._complexToMathML);
  return tmp;
};


Expression.PolynomialRootSymbol = PolynomialRootSymbol;

function isSameRoot(x, y) {
  return x instanceof Expression.PolynomialRootSymbol && y instanceof Expression.PolynomialRootSymbol && x.polynomial.equals(y.polynomial) && x.interval.a.equals(y.interval.a) && x.interval.b.equals(y.interval.b);
}

function ExpressionWithPolynomialRoot(e, root) {
  this.e = e; // internal symbolic expression with a "root" as a symbol
  this.root = root;
}




ExpressionWithPolynomialRoot.prototype = Object.create(Expression.Symbol.prototype);

/*
ExpressionWithPolynomialRoot.prototype.compare4Multiplication = function (y) {
  return y.compare4MultiplicationExpressionWithPolynomialRoot(this);
};
ExpressionWithPolynomialRoot.prototype.compare4MultiplicationExpressionWithPolynomialRoot = function (x) {
  return 0;//?
};
Expression.prototype.compare4MultiplicationExpressionWithPolynomialRoot = function (x) {
  return this.compare4MultiplicationSymbol(x);//?
};
Expression.Symbol.prototype.compare4MultiplicationExpressionWithPolynomialRoot = function (x) {
  return -1;
};
ExpressionWithPolynomialRoot.prototype.compare4MultiplicationSymbol = function (x) {
  return +1;
};
*/

//Expression.prototype.isExact = function () {
//  return true;
//};
ExpressionWithPolynomialRoot.prototype.isExact = function () {
  //TODO: fix - ?
  return false;
};

function simplifyExpressionWithPolynomialRoot(e, root) {
  var e1 = LazyPolynomialRoot._makeExpressionWithPolynomialRoot(e, root, root);
  if (Polynomial.toPolynomial(e1.getNumerator(), root).getDegree() <= 0 && Polynomial.toPolynomial(e1.getDenominator(), root).getDegree() <= 0) {
    return e1;
  }
  return new ExpressionWithPolynomialRoot(e1, root);
}

ExpressionWithPolynomialRoot.prototype.negate = function () {
  //return simplifyExpressionWithPolynomialRoot(this.e.negate(), this.root);
  return new ExpressionWithPolynomialRoot(this.e.negate(), this.root); // for performance
};
ExpressionWithPolynomialRoot.prototype.equals = function (other) {
  //!TODO: remove (hack to avoid error)
  if (this instanceof ExpressionWithPolynomialRoot && other instanceof ExpressionWithPolynomialRoot) {
    if (!isSameRoot(this.root, other.root)) {
      //var s1 = toDecimalStringInternal(new Expression.Addition(this.e, other.e.negate()), {fractionDigits: 3});
      //if (s1 != undefined && !s1.endsWith('000')) {
      //  return false;
      //}
      if (this.toMathML({rounding: {fractionDigits: 3}}) !== other.toMathML({rounding: {fractionDigits: 3}})) {
        return false;//?
      }
      if (true) {
        return this.upgrade().subtract(other.upgrade()).equals(Expression.ZERO);
      }
      var s = toDecimalStringInternal(new Expression.Addition(this.e, other.e.negate()), {significantDigits: 1});
      //TODO: will it hang for zero?
      return s === '0';
    }
  }
  //!
  //if (Expression.has(other, Expression.NthRoot)) {
  //  return this.upgrade().equals(Expression.toPolynomialRoot(other));//!?
  //}
  // optimization
  var s = other instanceof Expression.Integer && other.equals(Expression.ZERO) ? this : this.subtract(other);
  return s instanceof ExpressionWithPolynomialRoot ? false : s.equals(Expression.ZERO);
};
ExpressionWithPolynomialRoot.prototype.simplifyExpression = function () {
  return this;
};

var _isSimpleForUpgrade = function (e, root) {
  if (e instanceof Expression.Multiplication) {
    return true;//!?
  }
  if (e instanceof Expression.Addition && !(e.a instanceof Expression.Addition)) {
    return _isSimpleForUpgrade(e.a, root) && _isSimpleForUpgrade(e.b, root);
  }
  //TODO: other variants (?)
  return e.equals(root) ||
         e instanceof Expression.Integer || e instanceof Expression.Complex || e instanceof Expression.NthRoot ||
         e instanceof Expression.Exponentiation && _isSimpleForUpgrade(e.a, root) && e.b instanceof Expression.Integer ||
         e instanceof Expression.Multiplication && _isSimpleForUpgrade(e.a, root) && _isSimpleForUpgrade(e.b, root) ||
         e instanceof Expression.Division && _isSimpleForUpgrade(e.getNumerator(), root) && e.b instanceof Expression.Integer;
};

ExpressionWithPolynomialRoot.prototype.toString = function (options) {
  options = options || {};
  if (_isSimpleForUpgrade(this.e, this.root)) {
    return this.upgrade().toString(options);
  }
  //TODO: return 'polynomial-root of x**2+2x+1 on [a; b]';
  //TODO:
  if (this.equals(Expression.ZERO)) {
    return Expression.ZERO.toString(options);
  }
  //return this.e.toString(options);
  if (options.fractionDigits != null) {
    throw new TypeError('options.fractionDigits is deprecated, please use options.rounding');
  }
  var rounding = options.rounding || {fractionDigits: 3};
  //if (true) {
  //  return Expression.toDecimalString(this.e, Object.assign({}, options, {rounding: rounding}));
  //}
  if (!Expression.isConstant(this.e)) {
    return this.upgrade().toString(options);
  }
  var tmp = toDecimalStringInternal(this.e, rounding, undefined, undefined);
  return tmp;
};

ExpressionWithPolynomialRoot.prototype.toMathML = function (options) {
  options = options || {};
  if (_isSimpleForUpgrade(this.e, this.root)) {
    return this.upgrade().toMathML(options);
  }
  //TODO:
  if (this.equals(Expression.ZERO)) {
    return Expression.ZERO.toMathML(options);
  }
  //return this.e.toMathML(options);
  if (options.fractionDigits != null) {
    throw new TypeError('options.fractionDigits is deprecated, please use options.rounding');
  }
  var rounding = options.rounding || {fractionDigits: 3};
  if (true) {
    //return Expression.toDecimalString(this.e, );
    return this.e.toMathML(Object.assign({}, options, {rounding: rounding}));
  }
  var tmp = toDecimalStringInternal(this.e, rounding, Expression._decimalToMathML, Expression._complexToMathML);
  return tmp;
};

const calculateNewInterval = LazyPolynomialRoot._calculateNewInterval;//TODO: remove
const toSimpleInterval = LazyPolynomialRoot._toSimpleInterval;//TODO: remove

function upgrade(e, root) {
  if (e.equals(Expression.ZERO)) {
    return e;
  }
  if (e instanceof Expression.Integer) {
    return e;
  }
  var variable = root;
    //!new 2021-04-03
  if (true) {
  //if (e.getDenominator().equals(Expression.ONE)) {
    //var root = Expression.getVariable(e.getNumerator());
    //var root2 = Expression.getVariable(e.getDenominator());
    //root = root || root2;
    //root2 = root2 || root;
    //if (root instanceof PolynomialRootSymbol && root === root2) {
      var p = Polynomial.toPolynomial(e.getNumerator(), variable);
      var p2 = Polynomial.toPolynomial(e.getDenominator(), variable);
      if (p.hasIntegerCoefficients() && p2.hasIntegerCoefficients()) {
        if (e.getDenominator() instanceof Expression.Integer && !e.getDenominator().equals(Expression.ONE)) {
          //TODO: optimize (?)
          return upgrade(e.getNumerator(), root).divide(e.getDenominator());
        }
        //debugger;
        var resultant = Polynomial.toPolynomial(Polynomial.resultant(p.subtract(Polynomial.of(new Expression.Symbol('β')).multiply(p2)), root.polynomial), new Expression.Symbol('β')).primitivePart();
        var tmp = calculateNewInterval(resultant, function (precision) {
          return toSimpleInterval(e, precision);
        });
        var interval = tmp.interval;
        var newPolynomial = tmp.polynomial;
        return Expression.ExpressionPolynomialRoot._create(newPolynomial, interval);
      }
      //!new 2021-05-14 (TODO: CHECK)
      if (p2.hasIntegerCoefficients() && p.hasComplexCoefficients()) {
        return upgrade(p.map(c => c instanceof Expression.Integer ? c : c.real).calcAt(variable).divide(p2.calcAt(variable)), root).add(upgrade(p.map(c => c instanceof Expression.Integer ? Expression.ZERO : c.imaginary).calcAt(variable).divide(p2.calcAt(variable)), root).multiply(Expression.I));
      }
      //!
      //TODO: using grouping
    //}
    //debugger;
  //} else {
  //  return upgrade(e.getNumerator(), root).divide(upgrade(e.getDenominator(), root));
  //}
  }
  //!
  
  var cache = null;//TODO: ?
  var root = null;
  return Expression._map(function (x) {
    return x instanceof Expression.PolynomialRootSymbol && !(x instanceof Expression.ExpressionPolynomialRoot) ? (x === cache ? root : (cache = x, root = Expression.ExpressionPolynomialRoot._create(x.polynomial, x.interval))) : x;
  }, e);
}

ExpressionWithPolynomialRoot.prototype.multiply = function (other) {
  if (other instanceof ExpressionWithPolynomialRoot) {
    if (this.root !== other.root && !isSameRoot(this.root, other.root)) {
      return this.upgrade().multiply(other.upgrade());
    }
    return this.multiply(other.e);
  }
  if (Expression.has(other, Expression.ExpressionPolynomialRoot)) {//TODO: ?
    return this.upgrade().multiply(other);
  }
  return simplifyExpressionWithPolynomialRoot(this.e.multiply(other), this.root);
};
ExpressionWithPolynomialRoot.prototype.divide = function (other) {
  if (other.equals(Expression.ONE)) {
    return this;
  }
  if (other instanceof ExpressionWithPolynomialRoot) {
    if (this.root !== other.root && !isSameRoot(this.root, other.root)) {
      return this.upgrade().divide(other.upgrade());
    }
    var a = this.divide(other.e);
    //var b = this.multiply(other.inverse());
    //console.log(a.e.toString().replaceAll(a.root.symbol, 'x'));
    //console.log(b.e.toString().replaceAll(b.root.symbol, 'x'));
    return a;
  }
  if (Expression.has(other, Expression.ExpressionPolynomialRoot)) {//TODO: ?
    return this.upgrade().divide(other);
  }
  return simplifyExpressionWithPolynomialRoot(this.e.divide(other), this.root);
};
ExpressionWithPolynomialRoot.prototype.add = function (other) {
  if (other instanceof ExpressionWithPolynomialRoot) {
    if (this.root !== other.root && !isSameRoot(this.root, other.root)) {
      return this.upgrade().add(other.upgrade());
    }
    return this.add(other.e);
  }
  if (Expression.has(other, Expression.ExpressionPolynomialRoot)) {//TODO: ?
    return this.upgrade().add(other);
  }
  return simplifyExpressionWithPolynomialRoot(this.e.add(other), this.root);
};

ExpressionWithPolynomialRoot.prototype.divideExpression = function (other) {
  if (Expression.has(other, Expression.ExpressionPolynomialRoot)) {//TODO: ?
    return other.divide(this.upgrade());
  }
  return simplifyExpressionWithPolynomialRoot(other.divide(this.e), this.root);
};
ExpressionWithPolynomialRoot.prototype.multiplyExpression = function (other) {
  if (other.equals(Expression.ONE)) {
    return this;
  }
  if (Expression.has(other, Expression.ExpressionPolynomialRoot)) {//TODO: ?
    return other.multiply(this.upgrade());
  }
  return simplifyExpressionWithPolynomialRoot(other.multiply(this.e), this.root);
};
ExpressionWithPolynomialRoot.prototype.addExpression = function (other) {
  if (Expression.has(other, Expression.ExpressionPolynomialRoot)) {//TODO: ?
    return other.add(this.upgrade());
  }
  return simplifyExpressionWithPolynomialRoot(other.add(this.e), this.root);
};

ExpressionWithPolynomialRoot.prototype.getPrecedence = function () {
  if (Expression.isReal(this)) {
    return 1000;
  }
  //return this.e.getPrecedence();//? - division
  return 2; // it can be a complex number
};
ExpressionWithPolynomialRoot.prototype.isRightToLeftAssociative = function () {
  return true;
};
ExpressionWithPolynomialRoot.prototype.isUnaryPlusMinus = function () {
  if (Expression.isReal(this)) {
    return false;
  }
  return true;
};

ExpressionWithPolynomialRoot.prototype.isNegative = function () {
  //TODO: ?
  if (Expression.isReal(this)) {
    return !Expression._isPositive(this);
  }
  return this.e.isNegative();
};


ExpressionWithPolynomialRoot.prototype._nthRoot = function (n) {//?
  if (this.e === this.root) {//TODO: ?
    // PolynomialRootSymbol#_nthRoot - ?
    if (this.root.interval.a.getNumerator().compareTo(Expression.ZERO) < 0) {
      //TODO: check
      var newRoot = new Expression.PolynomialRootSymbol(this.root.polynomial._scaleRoots(Expression.ONE.negate()), {a: this.root.interval.b.negate(), b: this.root.interval.a.negate()});
      return Expression.I.multiply(new ExpressionWithPolynomialRoot(newRoot, newRoot)._nthRoot(n));
    }
    var precision = 3;
    var a = null;
    var b = null;
    do {
      a = ExpressionParser.parse(toDecimalStringInternal(this.root.interval.a._nthRoot(n), {significantDigits: precision}));
      b = ExpressionParser.parse(toDecimalStringInternal(this.root.interval.b._nthRoot(n), {significantDigits: precision}));
      precision *= 2;
      if (precision > 128) {
        debugger;
        throw new TypeError();
      }
    //TODO: fix !!!
    } while (a.equals(b));
    var newRoot = new Expression.PolynomialRootSymbol(this.root.polynomial._exponentiateRoots(1 / n), {a: a, b: b});
    if (newRoot.polynomial.numberOfRoots(newRoot.interval) === 1) {
      return new ExpressionWithPolynomialRoot(newRoot, newRoot);
    } else {
      console.assert(false);
      debugger;
    }
  }
  if (!(this.e instanceof Expression.Exponentiation)) {
    if (true && n === 2) {
      return this.upgrade()._nthRoot(n);
    }
  }
  return simplifyExpressionWithPolynomialRoot(this.e._nthRoot(n), this.root);
};
ExpressionWithPolynomialRoot.prototype.pow = function (count) {
  if (count instanceof Expression.Integer) {
    return simplifyExpressionWithPolynomialRoot(this.e._pow(count.value), this.root);
  } else {
    if (count instanceof Expression.Division && count.getDenominator() instanceof Expression.Integer) {
      return simplifyExpressionWithPolynomialRoot(this.e.pow(count.getNumerator()), this.root)._nthRoot(count.getDenominator().value);
    }
    //TODO: upgrade (?)
    return simplifyExpressionWithPolynomialRoot(this.e.pow(count), this.root);
  }
};
ExpressionWithPolynomialRoot.prototype._pow = function (count) {
  return simplifyExpressionWithPolynomialRoot(this.e.getNumerator()._pow(count), this.root).divide(simplifyExpressionWithPolynomialRoot(this.e.getDenominator()._pow(count), this.root));
};

//TODO: remove
ExpressionWithPolynomialRoot.prototype.upgrade = function () {
  return upgrade(this.e, this.root);
};

ExpressionWithPolynomialRoot.prototype.complexConjugate = function () {
  return simplifyExpressionWithPolynomialRoot(this.e.complexConjugate(), this.root);
};

ExpressionWithPolynomialRoot.prototype.toDecimal = function (precision = 0) {
  return this.e === this.root ? this.root.toDecimal(precision) : this.upgrade().toDecimal(precision);
};


//!new
ExpressionWithPolynomialRoot.prototype._calc = function (polynomial) {
  return simplifyExpressionWithPolynomialRoot(polynomial.calcAt(this.e), this.root);
};

export default ExpressionWithPolynomialRoot;
