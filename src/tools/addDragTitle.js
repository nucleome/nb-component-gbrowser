function addDragTitle(d,cfg) {
    function handleDragStart(e) {
      this.style.opacity = '0.4'; 
      e.dataTransfer.setData("track", JSON.stringify({
        "server":d.server,
        "prefix":d.prefix,
        "id":d.id,
        "longLabel":d.longLabel || d.id,
        "format":d.format || "unknown",
        "metaLink": d.metaLink || null
      }))
    }

    function handleDragOver(e) {
      if (e.preventDefault) {
        e.preventDefault(); // Necessary. Allows us to drop.
      }

      e.dataTransfer.dropEffect = 'move'; // See the section on the DataTransfer object.

      return false;
    }

    function handleDragEnter(e) {
      // this / e.target is the current hover target.
      this.classList.add('over');
    }

    function handleDragLeave(e) {
      this.classList.remove('over'); // this / e.target is previous target element.
    }

    function handleDrop(e) {
      // this / e.target is current target element.

      if (e.stopPropagation) {
        e.stopPropagation(); // stops the browser from redirecting.
      }
      var r = e.dataTransfer.getData("track")
      console.log(e.target, r)
      return false;
    }

    function handleDragEnd(e) {
      this.style.opacity = '1.0'; // this / e.target is the source node.
    }

    var cold3 = cfg.append("div").classed("title", true).style("height","30px")
    
    var col = cold3.node()
    var _text = cold3.append("span").attr("draggable",true).text(d.longLabel || d.id)
    col.addEventListener('dragstart', handleDragStart,
      false);
    /*
    col.addEventListener('dragenter', handleDragEnter,
      false);
    col.addEventListener('dragover', handleDragOver,
      false);
    col.addEventListener('dragleave', handleDragLeave,
      false);
    */
    col.addEventListener('drop', handleDrop, false);
    col.addEventListener('dragend', handleDragEnd,
      false);

}

export default addDragTitle
