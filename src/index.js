import RSVP from 'rsvp';
import sha256 from 'sha256';
import qz from 'qz-tray';

window.RSVP = RSVP;

const defaults = {
  printer: 'Zebra-Technologies-ZTC-ZT230-200dpi-ZP',
  settings: {}
};

export default class qzPrinty {
	constructor(options) {
		this.options = Object.assign({}, defaults, options);
		this.init();

    return {
      print: this.print.bind(this)
    }
	}
	init() {
    if (!this.config) {
      qz.api.setSha256Type(function(data) {
        return sha256(data);
      });

      this.config = qz.configs.create(this.options.printer, this.options.settings);
    }
	}
	print(input, type = 'html') {
		let self = this;

    let format = 'plain';
    if (type === 'pdf') format = 'file';

    if (!qz.websocket.isActive()) {
      qz.websocket.connect().then(function() { 
        self.print(input, type);
      }).catch(function(err) { console.log(err); });
    } else {
      if (Array.isArray(input)) {
        input.forEach(async (el) => {
          let data = [{
            type: type,
            format,
            data: el
          }];
          await qz.print(this.config, data).catch(function(e) {
            console.error(e);
          });
        })
      } else {
        let data = [{
          type: type,
          format,
          data: input
        }];
        qz.print(this.config, data).catch(function(e) {
          console.error(e);
        });
      }
    }
  }
}
 