var assert = require("assert")

if (process.argv[2] === 'child') {
  child()
} else {
  parent()
}

function child () {
  var i = 0

  process.on('exit', function () {
    // throw some arbitrary processing on ever other child proc
    if (process.argv[3] % 2) {
      for (var start = Date.now(), end = start + 1000; Date.now() < end;);
    }
    if (process.argv[3] % 3 === 0) {
      // throw some arbitrary stdout junk every third proc
      for (var j = 0; process.stdout.write(j+'\n') && j < 10000; j++);
    }
    console.log('exit')
  })

  output()

  function output () {
    i ++
    if (i < 10) {
      setTimeout(output, 100)
    }
  }
}

function parent () {
  var N = 1e6
  var n = 0
  var spawn = require("child_process").spawn
  runChild()

  function runChild () {
    var start = Date.now()
    var child = spawn(process.execPath, [__filename, 'child', n])
    var out = ''
    child.stdout.on('data', function (c) {
      out += c
    })
    child.on('close', function (code, signal) {
      assert.equal(code, 0)
      assert.equal(signal, null)
      assert.equal(out.trim().split('\n').pop(), 'exit')
      console.log('ok %d - pid=%d time=%d', ++n, child.pid, Date.now() - start)
      if (n < N) {
        runChild()
      } else {
        console.log('1..%d', n)
      }
    })
  }
}
