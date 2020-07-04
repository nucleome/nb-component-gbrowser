function addDrag(el,d) {
    function handleDragStart(e) {
      console.log("dragStart?")
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
      return false;
    }

    function handleDragEnd(e) {
      this.style.opacity = '1.0'; // this / e.target is the source node.
    }
    //el.style("cursor","grab").style("user-select","all")
        //.style("pointer-events","none") 
    el.attr("draggable",true)
    var col = el.node()
    //var _text = cold3.append("span").style("user-select","all").style("cursor","grab").text(d.longLabel || d.id)
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

export default addDrag
