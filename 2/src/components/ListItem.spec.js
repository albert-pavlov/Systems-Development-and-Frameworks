import { mount } from '@vue/test-utils'
import ListItem from './ListItem.vue'

describe('ListItem', () => {

    describe('given an `item`', () => {

        const dummy = { 
            id: "1", 
            message: "Foo" 
        };
        
        const wrapper = mount(ListItem, {
            propsData: {
                item: dummy
            }
        });

        test('init with dummy parameter', () => {
            expect(wrapper.vm.item).toBe(dummy);
        });

        test('renders item', () => {
            var foundItem = wrapper.find('#item-description');
            var itemDescription = wrapper.vm.item.id + '. ' + wrapper.vm.item.message;
            expect(foundItem.text()).toEqual(itemDescription);
        });

        test('does not show input field', () => {
            expect(wrapper.find('#input-edit').exists()).toBeFalsy();
        });

        describe('testing `Edit` button', () => {

            test('click on button shows input field', () => {
                wrapper.find('#button-edit-start').trigger('click');
                expect(wrapper.vm.editMode).toBe(true);
                expect(wrapper.find('#input-edit').exists()).toBeTruthy();
            });

            test('edit text and submit, hides input field', () => {
                wrapper.setData({ message: 'Edited Message' });
                wrapper.find('#button-save').trigger('click');
                var editedItem = {
                    id: "1",
                    message: "Edited Message"
                };
                expect(wrapper.vm.item).toEqual(editedItem);
                expect(dummy).toEqual(editedItem);
                expect(wrapper.vm.editMode).toBe(false);
                expect(wrapper.find('#input-edit').exists()).toBeFalsy();
            });
        });

        describe('testing `Delete` button', () => {

            test('click on button emits delete event', () => {
                //wrapper.vm.deleteItem();
                wrapper.find('#button-delete').trigger('click');
                //console.log(wrapper.emitted());
                var itemToDelete = wrapper.emitted('delete-item')[0][0];
                //console.log(itemToDelete);
                expect(itemToDelete.message).toEqual(wrapper.vm.item.message);
                expect(itemToDelete.message).toEqual(dummy.message);
            });
        });
    });
});