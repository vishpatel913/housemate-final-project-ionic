import { Component, Input } from '@angular/core';
import { Modal, ModalController, ModalOptions } from 'ionic-angular';
import { AngularFireDatabase } from "angularfire2/database";
import { TaskItem, Category } from '../../models/task-item/task-item.interface';
import { Categories } from '../../models/task-item/category.model';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'task-item',
  templateUrl: 'task-item.html'
})
export class TaskItemComponent {

  @Input('item') task: TaskItem;
  houseId: string;
  userName: string;
  category: Category;
  userTag: string;
  easterEgg: string;

  constructor(
    private modalCtrl: ModalController,
    private user: UserService,
    private database: AngularFireDatabase
  ) {
    this.houseId = user.houseId;
  }

  ngOnInit() {
    // sets task details
    this.category = Categories[this.task.category];
    this.setTaggedUser();
    this.easterEgg = this.getEasterEgg();
  }

  /**
   * toggleDone() toggles the task's done boolean in the database
   * and sets the done timestamp
   */
  toggleDone() {
    let timestamp = !this.task.done ? Math.floor(Date.now() / 1000) : this.task.timecreated;
    this.database.object<any>(`/houses/${this.houseId}/items/${this.task.id}`)
      .update({
        text: this.task.text,
        done: !this.task.done,
        timedone: timestamp
      });
  }

  /**
   * editItem() opens the item modal
   * inputs task data so that modal updates task in database
   */
  editItem() {
    const editModalOptions: ModalOptions = {
      showBackdrop: true,
      enableBackdropDismiss: true,
    };
    const editModalData = {
      id: this.task.id,
      text: this.task.text,
      category: this.task.category,
      createdby: this.task.createdby,
      taggeduser: this.task.taggeduser || '',
      important: this.task.important || false,
      houseId: this.houseId,
      new: false,
    };
    const editTaskModal: Modal = this.modalCtrl.create('TaskModal', { data: editModalData }, editModalOptions);
    editTaskModal.present();
  }

  /**
   * deleteItem() removes the item from the database
   */
  deleteItem() {
    this.database.object<any>(`/houses/${this.houseId}/items/${this.task.id}`)
      .remove();
  }

  /**
   * setTaggedUser() gets the tagged user name from the database
   * for use in the view
   */
  setTaggedUser() {
    let tagId = this.task.taggeduser;
    if (tagId && tagId !== '') {
      this.database.object<any>(`/houses/${this.houseId}/users/${tagId}`)
        .valueChanges().subscribe(user => {
          if (!!user) this.userTag = '@' + user.name.split(' ')[0];
        })
    }
  }

  /**
   * getEasterEgg() searches the task text for easter eggs
   * returns a string for use as an icon
   */
  getEasterEgg(): string {
    let text = this.task.text;
    if (text.search('.*(b|B)eer.*') == 0) return 'beer';
    else if (text.search('.*((c|C)rate|(p|P)ub).*') == 0) return 'beer';
    else if (text.search('.*(w|W)ine.*') == 0) return 'wine';
  }
}
