import { Component, Input } from '@angular/core';
import { Modal, ModalController, ModalOptions } from 'ionic-angular';
import { AngularFireDatabase } from "angularfire2/database";
import { TaskItem, CategoryObject } from '../../models/task-item/task-item.interface';
import { Category } from '../../models/task-item/category.model';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'task-item',
  templateUrl: 'task-item.html'
})
export class TaskItemComponent {

  @Input('item') task: TaskItem;
  houseId: string;
  userName: string;
  category: CategoryObject;

  constructor(
    private modalCtrl: ModalController,
    private user: UserService,
    private database: AngularFireDatabase
  ) {
    this.houseId = user.houseId;
  }

  ngOnInit() {
    this.category = Category[this.task.category];
  }

  toggleDone() {
    let timestamp = !this.task.done ? Math.floor(Date.now() / 1000) : this.task.timecreated;
    this.database.object<any>(`/houses/${this.houseId}/items/${this.task.id}`)
      .update({
        text: this.task.text,
        done: !this.task.done,
        timedone: timestamp
      });
  }

  editItem() {
    const editModalOptions: ModalOptions = {
      showBackdrop: true,
      enableBackdropDismiss: true,
    };
    const editModalData = {
      id: this.task.id,
      text: this.task.text,
      category: this.task.category,
      createdby: this.user.id,
      new: false,
      houseId: this.houseId,
    };
    const editItemModal: Modal = this.modalCtrl.create('ItemModal', { data: editModalData }, editModalOptions);
    editItemModal.present();
  }

  deleteItem() {
    this.database.object<any>(`/houses/${this.houseId}/items/${this.task.id}`)
      .remove();
  }

  getDoneClass() {
    return this.task.done ? 'done' : '';
  }
}
