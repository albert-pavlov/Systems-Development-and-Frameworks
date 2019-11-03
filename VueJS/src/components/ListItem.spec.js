import { mount } from '@vue/test-utils'
import ListItem from './ListItem.vue'

describe('ListItem', () => {
    describe('given an `item`', () => {
        const wrapper = mount(ListItem, {
            propsData: {
                item: { 
                    id: 1, 
                    message: "Foo" 
                }
            }
        });

        it('init with dummy parameter', () => {
            expect(wrapper.vm.item.id).toEqual(1);
            expect(wrapper.vm.item.message).toEqual("Foo");
        });

        it('renders item', () => {
            const foundItem = wrapper.find('p#item-description');
            expect(foundItem.text()).toEqual("1. Foo");
        });

        it('does not show input field', () => {
            expect(wrapper.find('input#input-edit').exists()).toBeFalsy();
        });

        describe('testing `Edit` button', () => {
            it('click on button shows input field', () => {
                wrapper.find('button#button-edit-start').trigger('click');
                expect(wrapper.find('input#input-edit').exists()).toBeTruthy();
            });

            it('edit text and submit, hides input field', () => {
                expect(wrapper.vm.editMode).toBeTruthy();
                wrapper.setData({ message: 'Edited message' });
                wrapper.find('button#button-save').trigger('click');
                expect(wrapper.vm.item.message).toEqual("Edited message");
                expect(wrapper.find('input#input-edit').exists()).toBeFalsy();
                expect(wrapper.vm.editMode).toBeFalsy();
            });
        });

        describe('testing `Delete` button', () => {
            it('click on button emits delete event', () => {
                wrapper.find('button#button-delete').trigger('click');
                const itemToDelete = wrapper.emitted('delete-item')[0][0];
                expect(itemToDelete.message).toEqual("Edited message");
            });
        });
    });
});