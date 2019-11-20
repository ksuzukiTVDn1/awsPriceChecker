import moment from 'moment';

export class CERequester {
  private ce: AWS.CostExplorer;

  constructor(ce: AWS.CostExplorer) {
    this.ce = ce;
  }

  getDimensionPrice(slack_ctx: any) {

    const params = {
      "TimePeriod": {
        "Start": moment().startOf('month').format("YYYY-MM-DD"),
        "End": moment().endOf('month').format("YYYY-MM-DD")
      },
      "Metrics": ["BlendedCost"],
      "Granularity": "MONTHLY",
      "GroupBy": [{
        "Key": "SERVICE",
        "Type": "DIMENSION"
      }]
    };
  
    this.ce.getCostAndUsage(params, (err: any , data: any) => {
      if (err) {
        console.log(err, err.stack);
      } else {
        var attachments: any[] = [];
        var cost: number = 0.0;

        for (const result of data.ResultsByTime) {
          const fields: any[] = [];
          for (const service of result.Groups) {
            const today = moment().format("DD");
            const lastDay = moment().endOf('month').format("DD");
            cost += parseFloat(service.Metrics.BlendedCost.Amount);

            const field_tmp = {
              'title': service.Keys[0],
              'value': service.Metrics.BlendedCost.Amount + service.Metrics.BlendedCost.Unit,
              'short': true
            };
            fields.push(field_tmp);
          }

          const attach_tmp = {
            "color": "#B2B228",
            "fields": fields
          };
          attachments.push(attach_tmp);
        }

        const total = {
          "color": "#B2B228",
          "fields": [{
            "title": "合計",
            "value": cost,
            "short": false
          }]
        };
        attachments.push(total);
        slack_ctx.send(attachments);
      }
    });
  }
}
