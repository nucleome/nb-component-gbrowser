export default function(a, arr) {
  var signal = false;
  arr.forEach(function (d) {
    if (d == a) {
      signal = true
    }
  })
  return signal
}
