"use strict"

const assert = require("assert")
const acorn = require("..")

function test(text, expectedResult, additionalOptions) {
  it(text, function () {
    const result = acorn.parse(text, Object.assign({ ecmaVersion: 9, plugins: { numericSeparator: true } }, additionalOptions))
    assert.deepEqual(result.body[0], expectedResult)
  })
}
function testFail(text, expectedError, additionalOptions) {
  it(text, function () {
    let failed = false
    try {
      acorn.parse(text, Object.assign({ ecmaVersion: 9, plugins: { numericSeparator: true } }, additionalOptions))
    } catch (e) {
      assert.equal(e.message, expectedError)
      failed = true
    }
    assert(failed)
  })
}

describe("acorn-numeric-separator", function () {
  testFail("'\\u{12_34}'", "Bad character escape sequence (1:4)")
  testFail("'\\u12_34'", "Bad character escape sequence (1:3)")
  testFail("let a\\u{12_34} = 5", "Bad character escape sequence (1:8)")

  const digits = [
    {d: "1_0", ast: start => ({
      type: "Literal",
      start: start,
      end: start + 3,
      value: 10,
      raw: "1_0",
    })},
    {d: "12e3_4", ast: start => ({
      type: "Literal",
      start: start,
      end: start + 6,
      value: 12e34,
      raw: "12e3_4",
    })},
    {d: "1_2e34", ast: start => ({
      type: "Literal",
      start: start,
      end: start + 6,
      value: 12e34,
      raw: "1_2e34",
    })},
    {d: "0b1010_1001", ast: start => ({
      type: "Literal",
      start: start,
      end: start + 11,
      value: 169,
      raw: "0b1010_1001",
    })},
    {d: "0xA0_B0_C0", ast: start => ({
      type: "Literal",
      start: start,
      end: start + 10,
      value: 0xa0b0c0,
      raw: "0xA0_B0_C0",
    })},
    {d: "0o70_60_50", ast: start => ({
      type: "Literal",
      start: start,
      end: start + 10,
      value: 0o706050,
      raw: "0o70_60_50",
    })},

    {d: "_2", ast: start => ({
      type: "Identifier",
      start: start,
      end: start + 2,
      name: "_2",
    })},
    {d: "0b_1", error: start => `Invalid numeric separator (1:${start + 2})`},
    {d: "0o_1", error: start => `Invalid numeric separator (1:${start + 2})`},
    {d: "0x_1", error: start => `Invalid numeric separator (1:${start + 2})`},
    {d: "2_", error: start => `Invalid numeric separator (1:${start + 1})`},
    {d: "2__4", error: start => `Invalid numeric separator (1:${start + 2})`},
    {d: "._4", error: start => `Unexpected token (1:${start})`},
    {d: "_.4", error: start => `Unexpected token (1:${start + 1})`},
    {d: "1._4", error: start => `Invalid numeric separator (1:${start + 2})`},
    {d: "1_.4", error: start => `Invalid numeric separator (1:${start + 1})`},
    {d: "_1.4", error: start => `Unexpected token (1:${start + 2})`},
    {d: "1.4_", error: start => `Invalid numeric separator (1:${start + 3})`},
    {d: "1.4_e2", error: start => `Invalid numeric separator (1:${start + 3})`},
    {d: "1.4e_2", error: start => `Invalid numeric separator (1:${start + 4})`},
    {d: "04_3_2", error: start => `Invalid number (1:${start})`},
    {d: "0_4_3_2", error: start => `Invalid number (1:${start})`},
  ]
  const statements = [
    {s: "let i = %s", ast: content => ({
      type: "VariableDeclaration",
      start: 0,
      end: content.end,
      kind: "let",
      declarations: [{
        type: "VariableDeclarator",
        start: 4,
        end: content.end,
        id: {
          type: "Identifier",
          start: 4,
          end: 5,
          name: "i"
        },
        init: content
      }]
    })},

    {s: "i = %s", ast: content => ({
      type: "ExpressionStatement",
      start: 0,
      end: content.end,
      expression: {
        type: "AssignmentExpression",
        start: 0,
        end: content.end,
        operator: "=",
        left: {
          type: "Identifier",
          start: 0,
          end: 1,
          name: "i"
        },
        right: content
      }
    })},

    {s: "((i = %s) => {})", ast: content => ({
      type: "ExpressionStatement",
      start: 0,
      end: content.end + 8,
      expression: {
        type: "ArrowFunctionExpression",
        start: 1,
        end: content.end + 7,
        id: null,
        generator: false,
        expression: false,
        async: false,
        params: [
          {
            type: "AssignmentPattern",
            start: 2,
            end: content.end,
            left: {
              type: "Identifier",
              start: 2,
              end: 3,
              name: "i"
            },
            right: content
          }
        ],
        body: {
          type: "BlockStatement",
          start: content.end + 5,
          end: content.end + 7,
          body: []
        }
      }
    })},

    {s: "for (let i = 10; i < %s;++i) {}", ast: content => ({
      type: "ForStatement",
      start: 0,
      end: content.end + 8,
      init: {
        type: "VariableDeclaration",
        start: 5,
        end: 15,
        declarations: [
          {
            type: "VariableDeclarator",
            start: 9,
            end: 15,
            id: {
              type: "Identifier",
              start: 9,
              end: 10,
              name: "i"
            },
            init: {
              type: "Literal",
              start: 13,
              end: 15,
              value: 10,
              raw: "10"
            }
          }
        ],
        kind: "let"
      },
      test: {
        type: "BinaryExpression",
        start: 17,
        end: content.end,
        left: {
          type: "Identifier",
          start: 17,
          end: 18,
          name: "i"
        },
        operator: "<",
        right: content
      },
      update: {
        type: "UpdateExpression",
        start: content.end + 1,
        end: content.end + 4,
        operator: "++",
        prefix: true,
        argument: {
          type: "Identifier",
          start: content.end + 3,
          end: content.end + 4,
          name: "i"
        }
      },
      body: {
        type: "BlockStatement",
        start: content.end + 6,
        end: content.end + 8,
        body: []
      }
    })},

    {s: "i + %s", ast: content => ({
      type: "ExpressionStatement",
      start: 0,
      end: content.end,
      expression: {
        type: "BinaryExpression",
        start: 0,
        end: content.end,
        left: {
          type: "Identifier",
          start: 0,
          end: 1,
          name: "i"
        },
        operator: "+",
        right: content
      }
    })}
  ]
  statements.forEach(statement => {
    const start = statement.s.indexOf("%s")
    digits.forEach(d => {
      (d.error ? testFail : test)(
        statement.s.replace("%s", d.d),
        d.error ? d.error(start) : statement.ast(d.ast(start))
      )
    })
  })

  // Make sure we didn't break anything
  test("123..toString(10)", {
    type: "ExpressionStatement",
    start: 0,
    end: 17,
    expression: {
      type: "CallExpression",
      start: 0,
      end: 17,
      callee: {
        type: "MemberExpression",
        start: 0,
        end: 13,
        object: {
          type: "Literal",
          start: 0,
          end: 4,
          raw: "123.",
          value: 123
        },
        property: {
          type: "Identifier",
          start: 5,
          end: 13,
          name: "toString"
        },
        computed: false,
      },
      arguments: [
        {
          type: "Literal",
          start: 14,
          end: 16,
          raw: "10",
          value: 10
        }
      ],
    }
  })
})
