import React, { Component } from "react";
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table";
import "../assets/css/Table.css";
import { 
  cloneDeep,
   mapValues, isEqual } from "lodash";
class CustomDataTable extends Component {
  
  state = {
    tableData:[],
    showTableLoading: false,
    options: {
      page: 1, // which page you want to show as default
      sizePerPageList: [
        {
          text: "10",
          value: 10
        },
        {
          text: "20",
          value: 20
        },
        {
          text: "50",
          value: 50
        }
      ], // you can change the dropdown list for size per page
      sizePerPage: 10, // which size per page you want to locate as default
      pageStartIndex: 1, // where to start counting the pages
      paginationSize: 3, // the pagination bar size.
      prePage: "Prev", // Previous page button text
      nextPage: "Next", // Next page button text
      firstPage: "First", // First page button text
      lastPage: "Last", // Last page button text
      paginationShowsTotal: this.renderShowsTotal,  // Accept bool or function
      // paginationPosition: 'top'  // default is bottom, top and both is all available
      hideSizePerPage: false, // //You can hide the dropdown for sizePerPage
      // alwaysShowAllBtns: true // Always show next and previous button
      withFirstAndLast: true, //> Hide the going to First and Last page button,
      onPageChange: (page, sizePerPage)=>this.onPageChange(page, sizePerPage),
      onSortChange: (sortName, sortOrder)=>this.onSortChange(sortName, sortOrder)
    },
    selectedRows:[],
    selectRowProp: {
      mode: "checkbox",
      clickToSelect: false,
      bgColor: "rgb(238, 193, 213)" ,
      onSelect: (row, isSelected)=>this.onRowSelect(row, isSelected),
      onSelectAll: (isSelected, currentDisplayAndSelectedData)=>this.onSelectAll(isSelected, currentDisplayAndSelectedData)
    }
  };

  onRowSelect(row, isSelected) {
    // console.log('here=> :', row, isSelected);
    const { selectedRows } = this.state;    
    if (isSelected) {
      let item = selectedRows.find((each)=>{return each===row.id});
      if(!item){
        selectedRows.push(row.id);
      } else{
        selectedRows.splice(selectedRows.indexOf(row.id),1);
      }
      console.log('The selection', row, isSelected, selectedRows);
    } else{
      selectedRows.splice(selectedRows.indexOf(row.id),1);
      // console.log('The selection', row, isSelected, selectedRows);
    }
    this.setState({selectedRows});
    if(this.props.setSelectedRows){
      this.props.setSelectedRows(selectedRows)
    }
  }

  onSelectAll(isSelected, currentDisplayAndSelectedData){
    let { selectedRows } = this.state;
    if(isSelected){
      selectedRows = currentDisplayAndSelectedData.map((each)=>{
        return each.id;
      })
    }else {
      selectedRows = [];
    }    
    this.setState({selectedRows});
    if(this.props.setSelectedRows){
      this.props.setSelectedRows(selectedRows)
    }   
  }

  renderShowsTotal(start, to, total) {
    return (
      <p style={ { color: '#FF7300',float:'left', marginRight:20 } }>
        From { start } to { to }, Out of { total }
      </p>
    );
  }

  onSortChange(sortName, sortOrder) {
    console.log('sizePerPage :', sortName, sortOrder);
    const { options } = this.state;
    options.sortName = sortName;
    options.sortOrder = sortOrder;
    this.setState({ options });
    this.props.onSortChange(sortName, sortOrder);
  }

  onPageChange(page, sizePerPage) {
    console.log('page, sizePerPage :', page, sizePerPage);
    // const { options } = this.state;
    // options.page = page;
    // options.sizePerPage = sizePerPage;
    // this.setState({ options });
    this.props.onPaginate(page, sizePerPage);
    // setTimeout(()=>{
    //   this.setState({ showTableLoading: true });
    // },100)
    // alert(`page: ${page}, sizePerPage: ${sizePerPage}`);
  }

  componentDidMount(){
    console.log('componentDidMount.tableData :', this.state.tableData);
  }

  

  render() {
    // console.log('object :', this.props);
    return (
      <div style={{position:'relative'}}>
        <BootstrapTable
          data={this.props.tableData}
          remote={ true }
          fetchInfo={ { dataTotalSize: this.props.totalCount } }
          pagination
          options={this.state.options}
          selectRow={this.props.rowSelection ? this.state.selectRowProp : {}}
          bodyContainerClass='adminTable'
          version="4"
          responsive
          hover={true}
          ref='table'
        >
          {this.props.headerKeys.map(header => (
            <TableHeaderColumn
              dataField={header.id}
              key={header.id}
              isKey={header.id === "id"}
              dataAlign="left"
              dataSort={ header.noSort ? false : true }
              hidden={header.id === 'id'}
              dataFormat={ (cell, row)=>this.props.dataFormat(cell, row, header.id) }
            >
              {header.label}
            </TableHeaderColumn>
          ))}
        </BootstrapTable>
        {this.props.showTableLoading && <div className="table-overlay">
          <div>
            <i className="fa fa-spinner fa-spin "></i>
          </div>
        </div>}
      </div>
    );
  }
}

export default CustomDataTable;
