import React  from 'react';
import { Layout, Divider, Row, Col, Table, Collapse, List, Space, Spin, Button, Form, Input, Skeleton, Popconfirm, message, Empty } from 'antd';
import { MessageOutlined, LikeOutlined, SettingOutlined } from '@ant-design/icons';
import { HttpService, FavoriteList, PhotoResult } from '../services/HttpService';
import Modal from 'antd/lib/modal/Modal';
import Text from 'antd/lib/typography/Text';
import FavoriteListPhoto from './FavoriteListPhoto/FavoriteListPhoto';
import AddFavoriteList from '../AddFavorite/AddFavoriteList';

export interface FavoriteListPageState {
  listSettingsModal: boolean;
  currentlyEditingList: FavoriteList
  favoriteLists: Array<FavoriteList>;
  selectedListId: string;
  loadedPhotos: Array<PhotoResult>;
  editingListTitle: string;
  editingListDescription: string;
  addNewListModal: boolean;
}

export interface FavoriteListPageProps {}

const { Panel } = Collapse;

class FavoriteListPage extends React.Component<FavoriteListPageProps, FavoriteListPageState> {

    state: FavoriteListPageState = {
      currentlyEditingList: {id: '', title: '', description: '', addedPhotoIds: []},
      listSettingsModal: false,
      favoriteLists: [],
      selectedListId: '',
      loadedPhotos: [],
      editingListTitle: '',
      editingListDescription: '',
      addNewListModal: false
    }

    componentDidMount= ()=> {
      this.setFavoriteListData()
    }

    setFavoriteListData = () => {
      const lists = HttpService.GetFavoriteLists()
      this.setState({
        favoriteLists: lists,
        addNewListModal: false
      })
    }

    getLoadedPhoto = (id: string) => {
      return this.state.loadedPhotos.find(photo=>photo.id === id)
    }

    getListPanel = (list: FavoriteList) => {
      const header = <Row>
        <Col span={6}>
          {list.title} 
        </Col>
        <Col span={18}>
        {list.description}
        </Col>
      </Row>

      let photoGroupAmount = 4;
      let photoIds = list.addedPhotoIds;
      let photoRows = []

      if(this.state.selectedListId === list.id && list.addedPhotoIds) {
          for(let i = 0; i < list.addedPhotoIds.length; i+=photoGroupAmount) {
              let photoIdGroup = photoIds.slice(i, i+photoGroupAmount);
              photoRows.push(this.getPhotoRow(photoIdGroup, i));
          }
      }

      return (
        <Panel 
          header={header}
          key={list.id}
          extra={<SettingOutlined style={{fontSize: '30px'}} onClick={()=>this.setState({listSettingsModal: true, currentlyEditingList: list, editingListDescription: list.description, editingListTitle: list.title})} />}>
            {photoRows.length > 0 ? photoRows.map((row)=>{
                  return row
              }) :  this.goToSearchPanel()}
        </Panel>
      )
    }

    goToSearchPanel = () => {
      return (
        <Empty
          description={<></>}>
            You haven't added any photos to this list yet.
        </Empty>
      )
    }

    getPhotoRow = (photoIds: Array<string>, index: number) => {
      return(<Row key={`photoRow-${index}`} gutter={[16,16]}>
                  {photoIds.map((photoId, index)=>{
                    let photo = this.getLoadedPhoto(photoId)
                    if(!photo) {return <Spin />}
                    return(<Col key={`photoCol-${photoId}`} span={6}>
                      <FavoriteListPhoto photo={photo} removePhotoFromList={(photoId: string)=>this.removePhotoFromList(photoId)}/>
                    </Col>)
                  })}
      </Row>)
    }

    getCollapseListData = () => {
      if(!this.state.favoriteLists){return}
      return this.state.favoriteLists.map((list: FavoriteList)=> {
          return this.getListPanel(list)
      })
    }

    onCollapseChange  = async (key: any) => {
      const currentList = this.state.favoriteLists.find((list: FavoriteList) => list.id === key)
      if(!currentList){return}
      let loadedPhotosUpdate = [] as any
      for(let photoId of currentList.addedPhotoIds) {
        if(!this.state.loadedPhotos.some(loadedPhoto => loadedPhoto.id === photoId)) {
          await HttpService.UnsplashGetPhoto(photoId).then((res: any)=>{
            loadedPhotosUpdate.push(res)
          })
        } 
      }
      let combined = loadedPhotosUpdate.concat(this.state.loadedPhotos)
      this.setState({
        selectedListId: key,
        loadedPhotos: combined
      })
    }

    saveListChanges = () => {
      const updateListInfo: FavoriteList = {
        id: this.state.currentlyEditingList.id,
        title: this.state.editingListTitle,
        description: this.state.editingListDescription,
        addedPhotoIds: this.state.currentlyEditingList.addedPhotoIds
      }
      HttpService.UpdateFavoriteListItem(updateListInfo)
      this.setFavoriteListData()
      this.setState({
        listSettingsModal: false
      })
    }

    deleteList = () => {
      HttpService.DeleteFavoriteListItem(this.state.currentlyEditingList.id);
      this.setFavoriteListData()
      this.setState({
        listSettingsModal: false
      })
    }

    removePhotoFromList = (photoId: string) => {
        HttpService.RemovePhotoFromList(photoId, this.state.selectedListId)
        this.setFavoriteListData()
    }

    render(): JSX.Element {
        return (
            <Layout style={{paddingTop: '20px', paddingLeft: '100px', paddingRight: '100px', paddingBottom: '20px'}}>
              <Collapse accordion onChange={(key)=>this.onCollapseChange(key)}>
                {this.getCollapseListData()}
              </Collapse>

              {(!this.state.favoriteLists || this.state.favoriteLists.length === 0) && 
                <Empty
                  description={<p>You don't have any favorite lists. Click the button below to get started now!</p>}>
                  <Button type="primary" onClick={()=>this.setState({addNewListModal: true})}>Create Favorite List</Button>
                </Empty>}
              {this.state.favoriteLists && this.state.favoriteLists.length !== 0 && 
              <Col>
                <Divider />
                <Button type="primary" size="large" onClick={()=>this.setState({addNewListModal: true})}>Create A New Favorite List</Button>
              </Col>}

              <Modal
                onCancel={()=>this.setState({addNewListModal: false})}
                visible={this.state.addNewListModal}
                title="Create new favorite list."
                style={{padding: '20px'}}
                footer={<></>}
              >
                  <AddFavoriteList setListData={()=>this.setFavoriteListData()} />
              </Modal>


              <Modal
                title="Edit Favorites List"
                style={{padding: '20px'}}
                footer={<Row style={{textAlign: 'center', width: "100%"}}>
                           <Popconfirm
                              placement="topRight"
                              title='Are you sure you want to delete this list?'
                              onConfirm={()=>this.deleteList()}
                              okText="Yes"
                              cancelText="No"
                            >
                              <Button danger type="primary">Delete</Button>
                            </Popconfirm>
                            
                            <Button type="primary" onClick={()=>this.saveListChanges()}>Save</Button>
                        </Row>}
                onCancel={()=>this.setState({listSettingsModal: false})}
                visible={this.state.listSettingsModal}>
                    <Form.Item
                        label="List Name"
                        rules={[{ required: false, message: 'Please input a list name' }]}
                    >
                        <Input 
                            onChange={(e)=>this.setState({editingListTitle: e.target.value})}
                            value={this.state.editingListTitle}
                            placeholder=""
                        />
                    </Form.Item>
                    <Form.Item
                        label="List Description"
                        rules={[{ required: false, message: 'Please input a list name' }]}
                    >
                        <Input 
                            onChange={(e)=>this.setState({editingListDescription: e.target.value})}
                            value={this.state.editingListDescription}
                            placeholder=""
                        />
                    </Form.Item>
              </Modal>
            </Layout>
        )
    }
}

export default FavoriteListPage