import React  from 'react';
import { Input, Form, Button, message } from 'antd';
import { HttpService, FavoriteList } from '../services/HttpService';

export interface AddFavoriteListState {
    listTitle: string;
    listDesc: string;
}

export interface AddFavoriteListProps {
    setListData: Function
}

class AddFavoriteList extends React.Component<AddFavoriteListProps, AddFavoriteListState> {

    state: AddFavoriteListState = {
        listTitle: '',
        listDesc: ''
    }

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
            this.props.setListData()
            this.setState({
                listTitle: '',
                listDesc: ''
            })
        } else {
            message.error("List with this title is already added. Please make a unique title.", 5)
            message.config({maxCount: 1});
        }
    }

    // TO DO: Use redux. Create reducer and selector for favorite list to reduce api calls. Can store in state but for sake of time I will make calls directly.
    render(): JSX.Element {
    
        return (
            <>
                <Form.Item
                    label="New List Name"
                    rules={[{ required: true, message: 'Please input a list name' }]}
                >
                    <Input 
                        onChange={(e)=>this.setState({listTitle: e.target.value})}
                        value={this.state.listTitle}
                        placeholder=""
                    />
                </Form.Item>
                <Form.Item
                    label="List Description"
                    rules={[{ required: false, message: 'Please input a list description' }]}
                >
                    <Input.TextArea autoSize={{ minRows: 2, maxRows: 6 }} value={this.state.listDesc} onChange={(e) => this.setState({listDesc: e.target.value})}/>
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" onClick={()=>this.addNewList()} disabled={!this.state.listTitle}>
                        Add new list
                    </Button>
                </Form.Item>
            </>
        )
    }
}

export default AddFavoriteList