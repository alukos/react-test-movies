;(function (window, document, undefined) {

  function TableSort (table) {
    this.rows = null;
    this.indexesColumns = Object.create(null);
    this.typesIdsColumns = Object.create(null);
    this.typeDefault = {
      name: 'string',
      compare: function (a, b) {
        a = a.toLowerCase();
        b = b.toLowerCase();
    
        if (a === b) return 0;
        if (a > b) return 1;
        return -1;
      }
    };
    this.init(table);
  }
  
  let types = [];
  
  TableSort.extendTypes = function (name, test, compare) {
    types.push({
      name, test, compare 
    });
  };
  
  TableSort.prototype.init = function (table) {
    this.body = table.getElementsByTagName('tbody')[0];
    this.rows = [ ...this.body.getElementsByTagName('tr') ];
    this.indexTemp = [ ...Array(this.rows.length).keys() ];
    
    const that = this;
    const onClick = function(e) {
      if (that.current) {
        if (that.current === this) {
          if (this.classList.contains('sort-down')) {
            this.classList.remove('sort-down');
            this.classList.add('sort-up');
            that.sort(this, 'desc');
          } else {
            this.classList.remove('sort-up');
            this.classList.add('sort-down');
            that.sort(this, 'asc');
          }
        } else {
          that.current.classList.remove('sort-up');
          that.current.classList.remove('sort-down');
          this.classList.add('sort-down');
          that.sort(this, 'asc');
        }
      } else {
        this.classList.add('sort-down');
        that.sort(this, 'asc');
      }
      that.current = this;
    }
    
    const headers = [ ...table.getElementsByTagName('th') ];
    headers.forEach(cell => cell.addEventListener('click', onClick, false));
  };

  TableSort.prototype.findCompareMethod = function (columnId) {
    if (this.typesIdsColumns[columnId] === 0) {
      return types[0].compare;
    }
    if (this.typesIdsColumns[columnId]) {
      return types[this.typesIdsColumns[columnId]].compare;
    } else {
      const some = types.some((type, typeId) => {
        this.typesIdsColumns[columnId] = typeId;
        return this.indexTemp.every(indx => {
          return type.test(this.rows[indx].cells[columnId].textContent);
        });
      });
      if (some) {
        return types[this.typesIdsColumns[columnId]].compare;
      }
    }
    
    return this.typeDefault.compare;
  };
  
  TableSort.prototype.compare = function (columnId, direction) {
    const compareMethod = this.findCompareMethod(columnId);
    return (a, b) => {
      const 
        valA = this.rows[a].cells[columnId].textContent,
        valB = this.rows[b].cells[columnId].textContent;
        
      if (direction === 'desc') return compareMethod(valB, valA);
      
      return compareMethod(valA, valB);
    };
  };
  
  TableSort.prototype.index = function (columnId, direction) {
    if (!this.indexesColumns[columnId]) {
      this.indexesColumns[columnId] = Object.create(null);
    }
    if (!this.indexesColumns[columnId][direction]) {
      const index = [...this.indexTemp];
      const compareMethod = this.compare(columnId, direction);
      index.sort(compareMethod);
      this.indexesColumns[columnId][direction] = index;
    }
    
    return this.indexesColumns[columnId][direction];
  };
  
  TableSort.prototype.sort = function (headerColumn, direction) {
    const columnId = headerColumn.cellIndex;
    const index = this.index(columnId, direction);
    index.forEach(i => this.body.appendChild(this.rows[i]));
  };
  
  window.TableSort = TableSort;
  
})(window, document);