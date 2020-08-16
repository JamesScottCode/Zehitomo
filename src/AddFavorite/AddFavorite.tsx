import React  from 'react';
import { Form, Button, Divider,  Table, message } from 'antd';
import { HttpService, FavoriteList, PhotoResult } from '../services/HttpService';
import AddFavoriteList from './AddFavoriteList';

export interface AddFavoriteState {
    tableData: Array<any>;
    selectedRowKeys: Array<string>;
    listTitle: string;
    listDesc: string;
}

export interface AddFavoriteProps {
    photo: PhotoResult; //TO DO: Passed from Photocard, which is passed from SearchPage... starting to prop drill. Redux would solve this (or context/hook) 
    closeAddFavorite: Function
}

class AddFavorite extends React.Component<AddFavoriteProps, AddFavoriteState> {

    state: AddFavoriteState = {
        tableData: [],
        selectedRowKeys: [],
        listTitle: '',
        listDesc: ''
    }

    componentDidMount() {
        this.setListData()
    }

    setListData = () => {
        const lists = HttpService.GetFavoriteLists() || []
        let tableArr = []
        for(const list of lists) {
            tableArr.push({
                key: list.id,
                listName: list.title,
                listDesc: list.description,
            })
        }
        this.setState({
            tableData: tableArr
        })
    }
      
    columns = [
        {
          title: 'List Name',
          dataIndex: 'listName',
          key: 'list',
        },
        {
          title: 'List Description',
          dataIndex: 'listDesc',
          key: 'listDesc',
        },
      ];

    //Must be typed as Array<any> to work with AntDesign component.
    onSelectChange = (selectedRowKeys: Array<any>) => {
        this.setState({ selectedRowKeys });
    };

    isListAlreadyAdded = (currentLists: Array<FavoriteList>) => {
        if(!currentLists){return false}
        for(const list of currentLists) {
            if(list.title === this.state.listTitle){
                return true
            }
        }
        return false
    }

    addNewList = () => {
        const currentLists = HttpService.GetFavoriteLists() || []
        if(!this.isListAlreadyAdded(currentLists)){
            const newList:FavoriteList = {
                id: HttpService.GenUUID(),
                title: this.state.listTitle,
                description: this.state.listDesc,
                addedPhotoIds: []
            }
            const updatedList = [...currentLists, newList]
            HttpService.AddFavoriteList(updatedList)
            this.setListData()
            this.setState({
                listTitle: '',
                listDesc: ''
            })
        } else {
            message.error("List with this title is already added. Please make a unique title.", 5)
            message.config({maxCount: 1});
        }
    }

    addPhoto = () => {
        let currentLists:Array<FavoriteList> = HttpService.GetFavoriteLists() || []
        for(let list of currentLists) {
            if(this.state.selectedRowKeys.includes(list.id) && !list.addedPhotoIds.includes(this.props.photo.id)){
                list.addedPhotoIds = [...list.addedPhotoIds, this.props.photo.id]
            }
        }
        HttpService.AddFavoriteList(currentLists)
        HttpService.AddPhotoIdToFavoritedPhotoIds(this.props.photo.id)
        this.props.closeAddFavorite()
        if(this.state.selectedRowKeys.length > 0) {
            message.success("Image added to the selected lists!")
            message.config({maxCount: 1})
        } else {
            message.success("Image added to favorites with no list selected!");
            message.config({maxCount: 1});
        }
    }

    render(): JSX.Element {
        const {  selectedRowKeys } = this.state;
        const rowSelection = {
        selectedRowKeys,
        onChange: this.onSelectChange,
        };
        return (
            <>
                <Table locale={{ emptyText: 'Create lists by using the form below' }} rowSelection={rowSelection} dataSource={this.state.tableData} columns={this.columns} pagination={false} scroll={{y: 250}}/>
                <Divider />
                <AddFavoriteList setListData={()=>this.setListData()} />
                <Divider />
                <Form.Item>
                    <Button type="primary" htmlType="submit" disabled={this.state.selectedRowKeys.length === 0} onClick={()=>this.addPhoto()}>
                        Add photo to favorites
                    </Button>
                    {this.state.selectedRowKeys.length === 0 && <p style={{color: 'red'}}>Please select a list to add this photo to.</p>}
                </Form.Item>
            </>
        )
    }
}

export default AddFavorite