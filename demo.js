var Bootes = require('./lib/bootes'),
    bootes = new Bootes();

bootes.use('aquila');

function discoverFoo(again) {
  bootes.discover('foo', function(err, url) {
  if (url) {
    console.log('Found service foo at url %s', url);
  } else {
    console.log('foo service not found - advertising');
    bootes.advertise('foo', 'bar://baz.com');
    if (!again) {
      discoverFoo(true)
    }
  }
});
}

discoverFoo();
