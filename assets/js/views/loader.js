import MainView    from './main';
import PageIndexView from './index';

// Collection of specific view modules
const views = {
  PageIndexView,
};

export default function loadView(viewName) {
  return views[viewName] || MainView;
}
