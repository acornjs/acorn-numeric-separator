"use strict"

module.exports = function (acorn) {
  acorn.plugins.numericSeparator = function (instance) {
    instance.extend("readInt", function (superF) {
      return function(radix, len) {
        // Hack: len is only != null for unicode escape sequences,
        // where numeric separators are not allowed
        if (len != null) return superF.call(this, radix, len)

        let start = this.pos, total = 0, acceptUnderscore = false
        for (;;) {
          let code = this.input.charCodeAt(this.pos), val
          if (code >= 97) val = code - 97 + 10 // a
          else if (code == 95) {
            if (!acceptUnderscore) this.raise(this.pos, "Invalid numeric separator")
            ++this.pos
            acceptUnderscore = false
            continue
          } else if (code >= 65) val = code - 65 + 10 // A
          else if (code >= 48 && code <= 57) val = code - 48 // 0-9
          else val = Infinity
          if (val >= radix) break
          ++this.pos
          total = total * radix + val
          acceptUnderscore = true
        }
        if (this.pos === start) return null
        if (!acceptUnderscore) this.raise(this.pos - 1, "Invalid numeric separator")

        return total
      }
    })

    instance.extend("readNumber", function (superF) {
      return function(startsWithDot) {
        const token = superF.call(this, startsWithDot)
        let octal = this.end - this.start >= 2 && this.input.charCodeAt(this.start) === 48
        const stripped = this.input.slice(this.start, this.end).replace(/_/g, "")
        if (stripped.length < this.end - this.start) {
          if (octal) this.raise(this.start, "Invalid number")
          this.value = parseFloat(stripped)
        }
        return token
      }
    })
  }

  return acorn
}
